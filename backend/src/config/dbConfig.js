import { Pool } from "pg";

const poolConfig = process.env.DB_CONNECTION_STRING
    ? { connectionString: process.env.DB_CONNECTION_STRING }
    : {
        user:     process.env.DB_USER,
        host:     process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port:     Number(process.env.DB_PORT) || 5432,
      };

const pool = new Pool({
    ...poolConfig,
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