import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import {Database, open} from 'sqlite';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware with proper configuration
// This handles OPTIONS requests automatically
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Middleware for JSON parsing
app.use(express.json());

// Initialize database connection
const dbPromise = open({
    filename: path.join(__dirname, 'supply_chain.db'),
    driver: sqlite3.Database
});

// Create tables if they don't exist
async function initializeDatabase() {
    const db = await dbPromise;

    // Create Putwall table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS putwall (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zone TEXT,
      cubby TEXT,
      pack_side_color TEXT,
      location_id TEXT,
      item_number TEXT,
      container_id TEXT,
      hu_id TEXT,
      sto_location TEXT,
      status TEXT,
      order_number TEXT,
      priority INTEGER,
      repln_pick_locaion TEXT,
      pick_location TEXT,
      work_type TEXT,
      pick_id TEXT,
      type TEXT,
      location_group TEXT
    )
  `);

    // Create Replenishment table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS replenishment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pack_lane TEXT,
      replen_qty INTEGER,
      demand_qty INTEGER,
      work_q_id TEXT,
      work_type TEXT,
      description TEXT,
      pick_ref_number TEXT,
      priority INTEGER,
      date_due TEXT,
      time_due TEXT,
      item_number TEXT,
      wh_id TEXT,
      location_id TEXT,
      from_location_id TEXT,
      work_status TEXT,
      qty INTEGER,
      workers_required INTEGER,
      workers_assigned INTEGER,
      zone TEXT,
      employee_id TEXT,
      priority_overridden BOOLEAN,
      datetime_stamp TIMESTAMP,
      sub_type TEXT,
      wave_id TEXT,
      replen_area TEXT
    )
  `);

    // Create UnitSort table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS unitsort (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      container_id TEXT,
      packlane TEXT,
      item_count INTEGER,
      order_date TEXT,
      RELEASED INTEGER,
      PICKED INTEGER,
      allocated_picks INTEGER,
      unallocated_picks INTEGER,
      replen_item_numbers_count INTEGER,
      pick_items TEXT,
      replen_task_item_numbers TEXT,
      replen_priorities TEXT,
      replen_work_status TEXT,
      location_id TEXT
    )
  `);

    // // Insert sample data for Putwall
    // const putwallCount = await db.get('SELECT COUNT(*) as count FROM putwall');
    // if (putwallCount.count === 0) {
    //     await insertSamplePutwallData(db);
    // }
    //
    // // Insert sample data for Replenishment
    // const replenishmentCount = await db.get('SELECT COUNT(*) as count FROM replenishment');
    // if (replenishmentCount.count === 0) {
    //     await insertSampleReplenishmentData(db);
    // }
    //
    // // Insert sample data for UnitSort
    // const unitsortCount = await db.get('SELECT COUNT(*) as count FROM unitsort');
    // if (unitsortCount.count === 0) {
    //     await insertSampleUnitSortData(db);
    // }
}

// Insert sample data functions
async function insertSamplePutwallData(db: Database) {
    const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ERROR'];
    const zones = ['A', 'B', 'C', 'D'];
    const replens = ['NORMAL', 'REPLEN001', 'REPLEN002', 'NO REPLENS'];

    for (let i = 0; i < 100; i++) {
        await db.run(`
      INSERT INTO putwall (
        zone, cubby, pack_side_color, location_id, item_number, container_id,
        hu_id, sto_location, status, order_number, priority, repln_pick_locaion,
        pick_location, work_type, pick_id, type, location_group
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            zones[Math.floor(Math.random() * zones.length)],
            `Cubby-${Math.floor(Math.random() * 100)}`,
            ['RED', 'BLUE', 'GREEN'][Math.floor(Math.random() * 3)],
            `LOC-${Math.floor(Math.random() * 1000)}`,
            `ITEM-${Math.floor(Math.random() * 1000)}`,
            `CONT-${Math.floor(Math.random() * 1000)}`,
            `HU-${Math.floor(Math.random() * 1000)}`,
            `STO-${Math.floor(Math.random() * 1000)}`,
            statuses[Math.floor(Math.random() * statuses.length)],
            `ORD-${Math.floor(Math.random() * 10000)}`,
            Math.floor(Math.random() * 5) + 1,
            replens[Math.floor(Math.random() * replens.length)],
            `PICK-${Math.floor(Math.random() * 1000)}`,
            ['NORMAL', 'EXPEDITED'][Math.floor(Math.random() * 2)],
            `PICK-ID-${Math.floor(Math.random() * 1000)}`,
            ['STANDARD', 'SPECIAL'][Math.floor(Math.random() * 2)],
            ['GROUP-A', 'GROUP-B', 'GROUP-C'][Math.floor(Math.random() * 3)]
        ]);
    }
}

async function insertSampleReplenishmentData(db: Database) {
    const packLanes = ['LANE-1', 'LANE-2', 'LANE-3', 'LANE-4', 'LANE-5'];
    const workStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    for (let i = 0; i < 100; i++) {
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 10));

        await db.run(`
      INSERT INTO replenishment (
        pack_lane, replen_qty, demand_qty, work_q_id, work_type, description,
        pick_ref_number, priority, date_due, time_due, item_number, wh_id,
        location_id, from_location_id, work_status, qty, workers_required,
        workers_assigned, zone, employee_id, priority_overridden, datetime_stamp,
        sub_type, wave_id, replen_area
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
            packLanes[Math.floor(Math.random() * packLanes.length)],
            Math.floor(Math.random() * 100) + 1,
            Math.floor(Math.random() * 100) + 1,
            `WQ-${Math.floor(Math.random() * 10000)}`,
            ['REPLEN', 'MOVE', 'PICK'][Math.floor(Math.random() * 3)],
            `Description for task ${i}`,
            `REF-${Math.floor(Math.random() * 10000)}`,
            Math.floor(Math.random() * 5) + 1,
            date.toISOString().split('T')[0],
            `${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}`,
            `ITEM-${Math.floor(Math.random() * 1000)}`,
            `WH-${Math.floor(Math.random() * 10)}`,
            `LOC-${Math.floor(Math.random() * 1000)}`,
            `FROM-LOC-${Math.floor(Math.random() * 1000)}`,
            workStatuses[Math.floor(Math.random() * workStatuses.length)],
            Math.floor(Math.random() * 100) + 1,
            Math.floor(Math.random() * 3) + 1,
            Math.floor(Math.random() * 3),
            ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            Math.random() < 0.7 ? `EMP-${Math.floor(Math.random() * 100)}` : null,
            Math.random() < 0.2,
            new Date().toISOString(),
            ['NORMAL', 'URGENT', 'SCHEDULED'][Math.floor(Math.random() * 3)],
            `WAVE-${Math.floor(Math.random() * 100)}`,
            ['FRONT', 'BACK', 'SIDE'][Math.floor(Math.random() * 3)]
        ]);
    }
}

async function insertSampleUnitSortData(db: Database) {
    const packlanes = ['LANE-1', 'LANE-2', 'LANE-3', 'LANE-4', 'LANE-5'];

    for (let i = 0; i < 80; i++) {
        const allocated = Math.floor(Math.random() * 50);
        const unallocated = Math.floor(Math.random() * 30);
        const replen = Math.floor(Math.random() * 20);

        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));

        await db.run(`
            INSERT INTO unitsort (
                container_id, packlane, item_count, order_date, RELEASED, PICKED,
                allocated_picks, unallocated_picks, replen_item_numbers_count, pick_items
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            `CONT-${Math.floor(Math.random() * 10000)}`,
            packlanes[Math.floor(Math.random() * packlanes.length)],
            Math.floor(Math.random() * 100) + 10,
            date.toISOString().split('T')[0],
            Math.floor(Math.random() * 100),
            Math.floor(Math.random() * 100),
            allocated,
            unallocated,
            replen,
            JSON.stringify(Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => `ITEM-${Math.floor(Math.random() * 1000)}`))
        ]);
    }
}

// API Routes for Putwall
app.get('/api/putwall/summary', async (req, res) => {
    try {
        const db = await dbPromise;
        const summary = await db.all(`
            SELECT substr(zone, 1, 3) as zone, status, COUNT(*) as count
            FROM putwall
            GROUP BY substr(zone, 1, 3), status
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(summary);
    } catch (error) {
        console.error('Error fetching putwall summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: 'Failed to fetch putwall summary' });
    }
});

app.get('/api/putwall/issues', async (req, res) => {
    try {
        const db = await dbPromise;
        const issues = await db.all(`
            SELECT repln_pick_locaion, COUNT(*) as count
            FROM putwall
            WHERE repln_pick_locaion LIKE 'REPLEN%' OR repln_pick_locaion = 'NO REPLENS'
            GROUP BY repln_pick_locaion
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(issues);
    } catch (error) {
        console.error('Error fetching putwall issues:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: 'Failed to fetch putwall issues' });
    }
});

app.get('/api/putwall/issue-details/:replen', async (req, res) => {
    try {
        const db = await dbPromise;
        const details = await db.all(`
            SELECT *
            FROM putwall
            WHERE repln_pick_locaion like '%${req.params.replen}%'
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(details);
    } catch (error) {
        console.error('Error fetching putwall issue details:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: 'Failed to fetch putwall issue details' });
    }
});

// API Routes for Replenishment
app.get('/api/replenishment/summary', async (req, res) => {
    try {
        const db = await dbPromise;
        const summary = await db.all(`
            SELECT pack_lane, COUNT(*) as count
            FROM replenishment
            GROUP BY pack_lane
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(summary);
    } catch (error) {
        console.error('Error fetching replenishment summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: 'Failed to fetch replenishment summary' });
    }
});

app.get('/api/replenishment/data', async (req, res) => {
    try {
        const db = await dbPromise;
        const data = await db.all('SELECT * FROM replenishment');
        res.header('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        console.error('Error fetching replenishment data:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: 'Failed to fetch replenishment data' });
    }
});

// API Routes for UnitSort
app.get('/api/unitsort/summary', async (req, res) => {
    try {
        const db = await dbPromise;
        const countData = await db.get(`
            SELECT
                COUNT(DISTINCT container_id) as container_count,
                SUM(allocated_picks) as total_allocated,
                SUM(unallocated_picks) as total_unallocated,
                SUM(replen_item_numbers_count) as total_replen
            FROM unitsort
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(countData);
    } catch (error) {
        console.error('Error fetching unitsort summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: 'Failed to fetch unitsort summary' });
    }
});

app.get('/api/unitsort/issues', async (req, res) => {
    try {
        const db = await dbPromise;
        const issues = await db.all(`
      SELECT *
      FROM unitsort
      WHERE unallocated_picks > 0 AND replen_item_numbers_count > 0
    `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(issues);
    } catch (error) {
        console.error('Error fetching unitsort issues:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({ error: 'Failed to fetch unitsort issues' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Initialize database and start server
initializeDatabase()
    .then(() => {
        // Add request logging middleware
        app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            next();
        });

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check available at http://localhost:${PORT}/api/health`);
        });
    })
    .catch(err => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });