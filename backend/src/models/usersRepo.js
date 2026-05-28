import pool from '../config/dbConfig.js';

export default class UsersRepository {

    async findAllUsers() {
        const query = `
            SELECT id, name, email, role, initials,
                   avatar_color AS color,
                   created_at AS "createdAt"
            FROM users
            ORDER BY name ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    async findUserById(id) {
        const query = `
            SELECT id, name, email, role, initials,
                   avatar_color AS color,
                   job_title AS "jobTitle", phone, location, timezone, bio,
                   created_at AS "createdAt"
            FROM users
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] ?? null;
    }
}
