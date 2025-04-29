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

    // Create PickDetail table
    await db.exec(`
    CREATE TABLE IF NOT EXISTS pickdetail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      container_id TEXT,
      order_number TEXT,
      status TEXT,
      item_number TEXT,
      pick_area TEXT
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
            JSON.stringify(Array.from({length: Math.floor(Math.random() * 10) + 1}, (_, i) => `ITEM-${Math.floor(Math.random() * 1000)}`))
        ]);
    }
}

// API Routes for Putwall
app.get('/api/putwall/cubbies', async (req, res) => {
    try {
        const db = await dbPromise;
        const summary = await db.all(`
            SELECT
                cubby,
                SUBSTR(cubby, 3, 1) as cubby_zone,
                SUBSTR(cubby, 5, 2) as cubby_wall,
                SUBSTR(cubby, 8, 1) as cubby_column,
                SUBSTR(cubby, 9, 2) as cubby_number
            FROM putwall;
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(summary);
    } catch (error) {
        console.error('Error fetching putwall summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch putwall summary'});
    }
});

app.get('/api/putwall/summary', async (req, res) => {
    try {
        const db = await dbPromise;
        const summary = await db.all(`
            select substr(zone, 1, 3) as zone,
                   sum(case when NOT EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) then 1 else 0 end) as PackReadyCount,
                   sum(case when EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (type = 'Y') then 1 else 0 end) as OnConveyorCount,
                   sum(case when EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (status = 'RELEASED') then 1 else 0 end) as PartiallyPickedCount,
                   sum(case when EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (repln_pick_locaion like 'REPLEN:%') then 1 else 0 end) as WaitingForReplensCount,
                   sum(case when EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (repln_pick_locaion like '%NO REPLENS%') then 1 else 0 end) as NoReplensCount,
                   sum(case when container_id = 'NULL' then 1 else 0 end) as EmptyCubbyCount
            from putwall t
            group by 1
            order by 1;
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(summary);
    } catch (error) {
        console.error('Error fetching putwall summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch putwall summary'});
    }
});

app.get('/api/putwall/data', async (req, res) => {
    try {
        const db = await dbPromise;

        const {status, zone, cubbyStatus} = req.query;

        let query = 'SELECT * FROM putwall t WHERE 1=1';
        const params = [];

        if (status) {
            query += ' AND t.status = ?';
            params.push(status);
        }

        if (zone) {
            query += ' AND t.zone like ?';
            params.push(`${zone}%`);
        }

        if (cubbyStatus) {
            switch (cubbyStatus) {
                case 'PACKREADY':
                    query += ' AND NOT EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id)';
                    break;
                case 'ONCONVEYOR':
                    query += ' AND EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (type = \'Y\')';
                    break;
                case 'PARTIALLYPICKED':
                    query += ' AND EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (status = \'RELEASED\')';
                    break;
                case 'WAITINGFORREPLENS':
                    query += ' AND EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (repln_pick_locaion like \'REPLEN:%\')';
                    break;
                case 'NOREPLENS':
                    query += ' AND EXISTS (select 1 from putwall where t.cubby = cubby and cubby != location_id) and (repln_pick_locaion like \'%NO REPLENS%\')';
                    break;
                case 'EMPTYCUBBY':
                    query += ' AND container_id = \'NULL\'';
                    break;
            }
        }

        const data = await db.all(query, params);

        res.header('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        console.error('Error fetching putwall data:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch putwall data'});
    }
});

// API Routes for Replenishment
app.get('/api/replenishment/summaryByPriority', async (req, res) => {
    try {
        const db = await dbPromise;
        const summary = await db.all(`
            SELECT
                pack_lane,
                CASE
                    WHEN CAST(priority AS INTEGER) >= 30 AND CAST(priority AS INTEGER) < 40 THEN '30-39'
                    WHEN CAST(priority AS INTEGER) >= 40 AND CAST(priority AS INTEGER) < 50 THEN '40-49'
                    WHEN CAST(priority AS INTEGER) >= 50 AND CAST(priority AS INTEGER) < 60 THEN '50-59'
                    WHEN CAST(priority AS INTEGER) >= 60 AND CAST(priority AS INTEGER) < 70 THEN '60-69'
                    WHEN CAST(priority AS INTEGER) >= 70 AND CAST(priority AS INTEGER) < 80 THEN '70-79'
                    WHEN CAST(priority AS INTEGER) >= 80 AND CAST(priority AS INTEGER) < 90 THEN '80-89'
                    WHEN CAST(priority AS INTEGER) >= 90 AND CAST(priority AS INTEGER) <= 100 THEN '90-100'
                    WHEN priority IS NULL THEN 'No Priority'
                    ELSE 'Other'
                    END as priority_range,
                COUNT(*) as count
            FROM replenishment
            GROUP BY
                pack_lane,
                2
            ORDER BY
                pack_lane,
                CASE
                    WHEN priority_range = 'No Priority' THEN 1
                    WHEN priority_range = 'Other' THEN 2
                    ELSE 3
                END,
                priority_range;
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(summary);
    } catch (error) {
        console.error('Error fetching replenishment summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch replenishment summary'});
    }
});

app.get('/api/replenishment/summary', async (req, res) => {
    try {
        const db = await dbPromise;
        const summary = await db.all(`
            SELECT pack_lane, SUM(replen_qty) as count
            FROM replenishment
            group by pack_lane
            order by pack_lane
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(summary);
    } catch (error) {
        console.error('Error fetching replenishment summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch replenishment summary'});
    }
});

app.get('/api/replenishment/data', async (req, res) => {
    try {
        const db = await dbPromise;
        const {pack_lane, zone, priority} = req.query;

        let query = 'SELECT pack_lane, work_type, case when from_location_id like \'%-%\' then substr(from_location_id, 1, 2) else from_location_id end as zone, priority, SUM(replen_qty) as TotalReplenUnits, SUM(case when demand_qty is null then 0 else demand_qty end) as TotalDemand from replenishment where 1=1';

        const params = [];

        if (pack_lane) {
            query += ' AND pack_lane = ?';
            params.push(pack_lane);
        }

        if (zone) {
            query += ' AND (from_location_id like ? OR from_location_id = ?)';
            params.push(`${zone}%`);
            params.push(zone);
        }

        if (priority) {
            query += ' AND priority = ?';
            params.push(priority);
        }

        query += ' group by 1, 2, 3, 4 order by 2, 3, 4'
        const data = await db.all(query, params);

        res.header('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        console.error('Error fetching replenishment data:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch replenishment data'});
    }
});

// API Routes for UnitSort
app.get('/api/unitsort/summary', async (req, res) => {
    try {
        const db = await dbPromise;
        const countData = await db.get(`
            select count(distinct container_id)                as PackageCount,
                   sum(cast(item_count as int))                as UnitCount,
                   sum(cast(RELEASED as int))                  as ReleasedUnits,
                   sum(cast(allocated_picks as int))           as AllocatedUnits,
                   sum(cast(unallocated_picks as int))         as UnallocatedUnits,
                   sum(cast(replen_item_numbers_count as int)) as ReplenSKUCount
            from unitsort
        `);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(countData);
    } catch (error) {
        console.error('Error fetching unitsort summary:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch unitsort summary'});
    }
});

app.get('/api/unitsort/data', async (req, res) => {
    try {
        const db = await dbPromise;
        const {containerId} = req.query;
        let query = 'select container_id, sum(cast(item_count as int)) as ItemCount, sum(cast(RELEASED as int)) as ReleasedUnits, sum(cast(allocated_picks as int)) as AllocatedUnits, sum(cast(unallocated_picks as int)) as UnallocatedUnits from unitsort';
        const params = [];

        if (containerId) {
            query += ' WHERE container_id like ?';
            params.push(`${containerId}%`);
        }

        query += ' group by container_id, pick_items';
        const data = await db.all(query, params);
        res.header('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        console.error('Error fetching unitsort data:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch unitsort data'});
    }
});

app.get('/api/container', async (req, res) => {
    try {
        const db = await dbPromise;
        const {container_id} = req.query;

        const query = 'select container_id, order_number, status, item_number, pick_area from pickdetail where container_id = ?';
        const params = [container_id];
        let data = await db.all(query, params);

        if (data.length === 0) {
            data = await db.all(`select container_id, order_number, status, item_number, pick_area from pickdetail where container_id = (select container_id from pickdetail order by random() limit 1)`);
        }

        res.header('Access-Control-Allow-Origin', '*');
        res.json(data);
    } catch (error) {
        console.error('Error fetching container details:', error);
        res.header('Access-Control-Allow-Origin', '*');
        res.status(500).json({error: 'Failed to fetch container details'});
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(200).json({status: 'healthy', timestamp: new Date().toISOString()});
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