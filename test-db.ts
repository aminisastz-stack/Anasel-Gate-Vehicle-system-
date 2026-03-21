import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'anasel',
  password: 'AnaselSecurity2025',
  host: '45.88.188.129',
  port: 5332,
  database: 'postgres',
  ssl: false
});

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
}

test();
