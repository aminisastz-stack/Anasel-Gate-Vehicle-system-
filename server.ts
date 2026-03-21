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
const pool = new Pool({
  user: 'anasel',
  password: 'AnaselSecurity2025',
  host: '45.88.188.129',
  port: 5332,
  database: 'postgres',
  ssl: false
});

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
        log_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Registered Vehicles Table (Mock data for verification)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registered_vehicles (
        plate_number VARCHAR(255) PRIMARY KEY,
        owner_name VARCHAR(255),
        parking_number VARCHAR(50)
      );
    `);

    // Parking Status Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parking_status (
        parking_number VARCHAR(50) PRIMARY KEY,
        is_occupied BOOLEAN DEFAULT FALSE,
        occupied_by_plate VARCHAR(255),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert a mock registered vehicle if the table is empty
    const countRes = await pool.query('SELECT COUNT(*) FROM registered_vehicles');
    if (parseInt(countRes.rows[0].count) === 0) {
      await pool.query("INSERT INTO registered_vehicles (plate_number, owner_name, parking_number) VALUES ('T 122 ABB', 'John Doe', 'P-101')");
      await pool.query("INSERT INTO registered_vehicles (plate_number, owner_name, parking_number) VALUES ('T 456 DEF', 'Jane Smith', 'P-102')");
      await pool.query("INSERT INTO registered_vehicles (plate_number, owner_name, parking_number) VALUES ('T 789 GHI', 'Robert Johnson', 'P-101')"); // Shared parking
      
      // Initialize parking status
      await pool.query("INSERT INTO parking_status (parking_number) VALUES ('P-101') ON CONFLICT DO NOTHING");
      await pool.query("INSERT INTO parking_status (parking_number) VALUES ('P-102') ON CONFLICT DO NOTHING");
    }

    console.log('Database tables verified/created successfully.');
  } catch (err) {
    console.error('Database Setup Error:', err);
  }
}

setupDB();

// API Endpoint: Verify Plate
app.post('/api/verify-plate', async (req, res) => {
  const { plateNumber, officerName = 'Officer Johnson', direction = 'in' } = req.body;
  
  if (!plateNumber) {
    return res.status(400).json({ error: 'Plate number is required' });
  }

  try {
    // 1. Verify against registered database
    const checkRes = await pool.query('SELECT * FROM registered_vehicles WHERE plate_number = $1', [plateNumber]);
    const isRegistered = checkRes.rows.length > 0;
    
    if (!isRegistered) {
      await pool.query(
        'INSERT INTO gate_verification (plate_number, access_status, officer_name, direction, log_time) VALUES ($1, $2, $3, $4, NOW())',
        [plateNumber, 'Access Denied', officerName, direction]
      );
      return res.json({ 
        status: 'Access Denied', 
        isRegistered: false,
        plateNumber,
        officerName,
        reason: 'Vehicle not registered'
      });
    }

    const vehicle = checkRes.rows[0];
    const parkingNumber = vehicle.parking_number;
    const ownerName = vehicle.owner_name;

    // 2. Check Parking Occupancy
    let accessStatus = 'Access Granted';
    let reason = '';

    if (direction === 'in') {
      const parkingRes = await pool.query('SELECT * FROM parking_status WHERE parking_number = $1', [parkingNumber]);
      
      if (parkingRes.rows.length === 0) {
        // Initialize if not exists
        await pool.query('INSERT INTO parking_status (parking_number, is_occupied, occupied_by_plate) VALUES ($1, TRUE, $2)', [parkingNumber, plateNumber]);
      } else if (parkingRes.rows[0].is_occupied) {
        accessStatus = 'Access Denied';
        reason = `Parking ${parkingNumber} already occupied by ${parkingRes.rows[0].occupied_by_plate}`;
      } else {
        // Mark as occupied
        await pool.query('UPDATE parking_status SET is_occupied = TRUE, occupied_by_plate = $1, last_updated = NOW() WHERE parking_number = $2', [plateNumber, parkingNumber]);
      }
    } else {
      // Direction is OUT
      await pool.query('UPDATE parking_status SET is_occupied = FALSE, occupied_by_plate = NULL, last_updated = NOW() WHERE parking_number = $1', [parkingNumber]);
      accessStatus = 'Access Granted';
      reason = 'Vehicle exited, parking cleared';
    }

    // 3. Automated Logging
    await pool.query(
      'INSERT INTO gate_verification (plate_number, access_status, officer_name, direction, parking_number, log_time) VALUES ($1, $2, $3, $4, $5, NOW())',
      [plateNumber, accessStatus, officerName, direction, parkingNumber]
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
      reason
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Internal server error during verification' });
  }
});

// API Endpoint: Get Stats
app.get('/api/stats', async (req, res) => {
  try {
    const entriesRes = await pool.query(`
      SELECT COUNT(*) FROM gate_verification 
      WHERE DATE(log_time) = CURRENT_DATE
    `);
    const deniedRes = await pool.query(`
      SELECT COUNT(*) FROM gate_verification 
      WHERE access_status = 'Access Denied' AND DATE(log_time) = CURRENT_DATE
    `);
    
    res.json({
      entries: parseInt(entriesRes.rows[0].count),
      denied: parseInt(deniedRes.rows[0].count)
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error fetching stats' });
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
