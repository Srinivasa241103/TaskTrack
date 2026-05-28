import pool from '../config/dbConfig.js';

export default class UserRepository {

    async createUser(user) {
        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role
        `;
        const result = await pool.query(query, [
            user.name,
            user.email,
            user.password,
            user.role,
        ]);
        return result.rows[0];
    }

    async getUserByEmail(email) {
        const query = `
            SELECT id, name, email, password_hash, role
            FROM users
            WHERE email = $1
            LIMIT 1
        `;
        const result = await pool.query(query, [email]);
        return result.rows[0] ?? null;
    }

    async storeRefreshToken(token, userId) {
        const query = `
            INSERT INTO refresh_tokens (user_id, token, expires_at)
            VALUES ($1, $2, NOW() + INTERVAL '7 days')
        `;
        const result = await pool.query(query, [userId, token]);
        return result.rowCount > 0;
    }

    async getRefreshTokenRecord(token) {
        const query = `
            SELECT user_id, expires_at
            FROM refresh_tokens
            WHERE token = $1 AND expires_at > NOW()
            LIMIT 1
        `;
        const result = await pool.query(query, [token]);
        return result.rows[0] ?? null;
    }

    async deleteRefreshToken(token) {
        const query = `DELETE FROM refresh_tokens WHERE token = $1`;
        const result = await pool.query(query, [token]);
        return result.rowCount > 0;
    }
}
