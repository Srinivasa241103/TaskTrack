import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DB_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
})

pool.connect()
    .then(() => console.log("Database connected"))
    .catch(err => {
        console.error("Database connection error:", err.message)
        process.exit(1)
    })

export default pool;