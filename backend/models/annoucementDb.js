const db = require("../config/db");

const announcementDB = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS announcements (
            id SERIAL PRIMARY KEY,
            mosque_id INTEGER NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
            imam_id INTEGER NOT NULL REFERENCES imams(id) ON DELETE CASCADE,
            deceased_name VARCHAR(150) NOT NULL,
            deceased_nickName VARCHAR(150) DEFAULT NULL,
            deceased_address TEXT DEFAULT NULL,
            area TEXT DEFAULT NULL,
            relative_names TEXT DEFAULT NULL,
            janaza_time TIMESTAMPTZ DEFAULT NULL,
            janaza_location VARCHAR(150) DEFAULT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    console.log("Announcements table created");
};

announcementDB()
    .then(() => {
        console.log("Database initialized successfully");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error initializing database:", err);
        process.exit(1);
    });