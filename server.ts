import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
const PORT = 3000;

// Initialize DB Connection
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  ssl: false
};

if (!dbConfig.user || !dbConfig.password || !dbConfig.host || !dbConfig.database) {
  console.error('Missing required database environment variables.');
  process.exit(1);
}

const pool = new Pool(dbConfig);

// Setup DB tables
async function setupDB() {
  console.log('Attempting to connect to database...');
  try {
    // Core Verification Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gate_verification (
        id SERIAL PRIMARY KEY,
        plate_number VARCHAR(255),
        access_status VARCHAR(50),
        officer_name VARCHAR(255),
        direction VARCHAR(10) DEFAULT 'in',
        parking_number VARCHAR(50),
        residence_id VARCHAR(50),
        log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Registered Vehicles Table (Mock data for verification)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registered_vehicles (
        plate_number VARCHAR(255) PRIMARY KEY,
        owner_name VARCHAR(255),
        parking_number VARCHAR(50),
        residence_id VARCHAR(50)
      );
    `);

    // Residences Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS residences (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255),
        location VARCHAR(255),
        company_id VARCHAR(50)
      );
    `);

    // Parking Status Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parking_status (
        parking_number VARCHAR(50) PRIMARY KEY,
        is_occupied BOOLEAN DEFAULT FALSE,
        occupied_by_plate VARCHAR(255),
        residence_id VARCHAR(50),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert mock residences if empty
    const resCount = await pool.query('SELECT COUNT(*) FROM residences');
    if (parseInt(resCount.rows[0].count) === 0) {
      await pool.query("INSERT INTO residences (id, name, location, company_id) VALUES ('s1', 'North Gate Residential', '123 North St', 'c1')");
      await pool.query("INSERT INTO residences (id, name, location, company_id) VALUES ('s2', 'Industrial Park West', '456 West Ave', 'c1')");
    }

    // Insert a mock registered vehicle if the table is empty
    const countRes = await pool.query('SELECT COUNT(*) FROM registered_vehicles');
    if (parseInt(countRes.rows[0].count) === 0) {
      await pool.query("INSERT INTO registered_vehicles (plate_number, owner_name, parking_number, residence_id) VALUES ('T 122 ABB', 'John Doe', 'P-101', 's1')");
      await pool.query("INSERT INTO registered_vehicles (plate_number, owner_name, parking_number, residence_id) VALUES ('T 456 DEF', 'Jane Smith', 'P-102', 's1')");
      await pool.query("INSERT INTO registered_vehicles (plate_number, owner_name, parking_number, residence_id) VALUES ('T 789 GHI', 'Robert Johnson', 'P-101', 's2')"); 
      
      // Initialize parking status
      await pool.query("INSERT INTO parking_status (parking_number, residence_id) VALUES ('P-101', 's1') ON CONFLICT DO NOTHING");
      await pool.query("INSERT INTO parking_status (parking_number, residence_id) VALUES ('P-102', 's1') ON CONFLICT DO NOTHING");
    }

    console.log('Database tables verified/created successfully.');
  } catch (err) {
    console.error('Database Setup Error:', err);
  }
}

setupDB();

// API Endpoint: Verify Plate
app.post('/api/verify-plate', async (req, res) => {
  const { plateNumber, officerName = 'Officer Johnson', direction = 'in', residenceId } = req.body;
  
  if (!plateNumber) {
    return res.status(400).json({ error: 'Plate number is required' });
  }

  try {
    // 1. Verify against registered database
    let query = 'SELECT * FROM registered_vehicles WHERE plate_number = $1';
    let params = [plateNumber];
    
    if (residenceId) {
      query += ' AND residence_id = $2';
      params.push(residenceId);
    }

    const checkRes = await pool.query(query, params);
    const isRegistered = checkRes.rows.length > 0;
    
    if (!isRegistered) {
      await pool.query(
        'INSERT INTO gate_verification (plate_number, access_status, officer_name, direction, residence_id, log_time) VALUES ($1, $2, $3, $4, $5, NOW())',
        [plateNumber, 'Access Denied', officerName, direction, residenceId]
      );
      return res.json({ 
        status: 'Access Denied', 
        isRegistered: false,
        plateNumber,
        officerName,
        reason: 'Vehicle not registered or not authorized for this residence'
      });
    }

    const vehicle = checkRes.rows[0];
    const parkingNumber = vehicle.parking_number;
    const ownerName = vehicle.owner_name;
    const vehicleResidenceId = vehicle.residence_id;

    // 2. Check Parking Occupancy
    let accessStatus = 'Access Granted';
    let reason = '';

    if (direction === 'in') {
      const parkingRes = await pool.query('SELECT * FROM parking_status WHERE parking_number = $1 AND residence_id = $2', [parkingNumber, vehicleResidenceId]);
      
      if (parkingRes.rows.length === 0) {
        // Initialize if not exists
        await pool.query('INSERT INTO parking_status (parking_number, is_occupied, occupied_by_plate, residence_id) VALUES ($1, TRUE, $2, $3)', [parkingNumber, plateNumber, vehicleResidenceId]);
      } else if (parkingRes.rows[0].is_occupied) {
        accessStatus = 'Access Denied';
        reason = `Parking ${parkingNumber} already occupied by ${parkingRes.rows[0].occupied_by_plate}`;
      } else {
        // Mark as occupied
        await pool.query('UPDATE parking_status SET is_occupied = TRUE, occupied_by_plate = $1, last_updated = NOW() WHERE parking_number = $2 AND residence_id = $3', [plateNumber, parkingNumber, vehicleResidenceId]);
      }
    } else {
      // Direction is OUT
      await pool.query('UPDATE parking_status SET is_occupied = FALSE, occupied_by_plate = NULL, last_updated = NOW() WHERE parking_number = $1 AND residence_id = $2', [parkingNumber, vehicleResidenceId]);
      accessStatus = 'Access Granted';
      reason = 'Vehicle exited, parking cleared';
    }

    // 3. Automated Logging
    await pool.query(
      'INSERT INTO gate_verification (plate_number, access_status, officer_name, direction, parking_number, residence_id, log_time) VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [plateNumber, accessStatus, officerName, direction, parkingNumber, vehicleResidenceId]
    );

    // 4. Security Alerts
    if (accessStatus === 'Access Denied') {
      console.warn(`[SECURITY ALERT] Plate ${plateNumber} DENIED. ${reason}. Logged by ${officerName}.`);
    } else {
      console.log(`[ACCESS GRANTED] Plate ${plateNumber} verified (${direction}). Logged by ${officerName}.`);
    }

    res.json({ 
      status: accessStatus, 
      isRegistered,
      plateNumber,
      ownerName,
      officerName,
      parkingNumber,
      residenceId: vehicleResidenceId,
      reason
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

// API Endpoint: Get Stats
app.get('/api/stats', async (req, res) => {
  const { residenceId } = req.query;
  try {
    let entriesQuery = 'SELECT COUNT(*) FROM gate_verification WHERE DATE(log_time) = CURRENT_DATE';
    let deniedQuery = "SELECT COUNT(*) FROM gate_verification WHERE access_status = 'Access Denied' AND DATE(log_time) = CURRENT_DATE";
    let params = [];

    if (residenceId) {
      entriesQuery += ' AND residence_id = $1';
      deniedQuery += ' AND residence_id = $1';
      params.push(residenceId);
    }

    const entriesRes = await pool.query(entriesQuery, params);
    const deniedRes = await pool.query(deniedQuery, params);
    
    res.json({
      entries: parseInt(entriesRes.rows[0].count),
      denied: parseInt(deniedRes.rows[0].count)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error fetching stats' });
  }
});

// API Endpoint: Get Residences
app.get('/api/residences', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM residences');
    res.json(result.rows);
  } catch (error) {
    console.error('Residences error:', error);
    res.status(500).json({ error: 'Internal server error fetching residences' });
  }
});

// API Endpoint: Check DB Status
app.get('/api/db-status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', time: result.rows[0].now });
  } catch (error) {
    console.error('DB Connection error:', error);
    res.status(500).json({ status: 'error', error: String(error) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
