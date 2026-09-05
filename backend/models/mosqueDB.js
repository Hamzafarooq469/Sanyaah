
const db = require("../config/db");

const mosqueDB = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS mosques (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            address TEXT NOT NULL,
            area VARCHAR(200) NOT NULL,
            tehsil VARCHAR(100) NOT NULL,
            district VARCHAR(100) NOT NULL,
            province VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    console.log("Mosques table created");
};

mosqueDB()
    .then(() => {
        console.log("Database initialized successfully");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error initializing database:", err);
        process.exit(1);
    });