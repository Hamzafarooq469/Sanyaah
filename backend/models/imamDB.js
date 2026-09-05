const db = require("../config/db");

const imamDB = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS imams (
            id SERIAL PRIMARY KEY,
            firebase_uid VARCHAR(100) NOT NULL UNIQUE,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            mosque_id INTEGER UNIQUE REFERENCES mosques(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    console.log("Imams table created");
};

imamDB()
    .then(() => {
        console.log("Database initialized successfully");
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error initializing database:", err);
        process.exit(1);
    });