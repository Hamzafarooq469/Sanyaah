

const dotenv = require('dotenv')
const { Pool } = require('pg')

dotenv.config({ 
    path: "./config/.env"
 })


const connectionString = process.env.DATABASE_URL || null

const pool = new Pool(
    connectionString
        ? {
                connectionString,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            }
        : {
                user: process.env.PGUSER || process.env.DB_USER || 'postgres',
                host: process.env.PGHOST || process.env.DB_HOST || 'localhost',
                database: process.env.PGDATABASE || process.env.DB_NAME || 'postgres',
                password: process.env.PGPASSWORD || process.env.DB_PASS || process.env.DB_PASSWORD || undefined,
                port: parseInt(process.env.PGPORT || process.env.DB_PORT || '5432', 10),
            }
)

pool
    .connect()
    .then((client) => {
        client.release()
        console.log('Postgres connected')
    })
    .catch((err) => {
        console.error('Postgres connection error:', err.stack || err)
    })

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
}
