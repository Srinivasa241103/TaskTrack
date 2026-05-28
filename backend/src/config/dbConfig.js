import { Pool } from "pg";

const pool = new Pool({
    user:     process.env.DB_USER,
    host:     process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port:     Number(process.env.DB_PORT) || 5432,
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