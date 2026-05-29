import pool from '../config/dbConfig.js';

export default class ProjectRepository {

    async findProjectsByUserId(userId) {
        const query = `
            SELECT
                p.id, p.name, p.key, p.description, p.color,
                p.owner_id AS "ownerId",
                p.created_at AS "createdAt",
                p.updated_at AS "updatedAt",
                COUNT(t.id) AS total_tasks,
                COUNT(t.id) FILTER (WHERE t.status = 'done') AS done_tasks
            FROM projects p
            LEFT JOIN tasks t ON t.project_id = p.id
            JOIN project_members pm ON pm.project_id = p.id AND pm.user_id = $1
            GROUP BY p.id
            ORDER BY p.updated_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    async getProjectMembersByIds(projectIds) {
        const query = `
            SELECT
                pm.project_id AS "projectId",
                u.id, u.name, u.initials,
                u.avatar_color AS "avatarColor",
                u.role
            FROM project_members pm
            JOIN users u ON u.id = pm.user_id
            WHERE pm.project_id = ANY($1::uuid[])
        `;
        const result = await pool.query(query, [projectIds]);
        return result.rows;
    }

    async createProject(data, userId) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const insertProject = `
                INSERT INTO projects (name, key, description, color, owner_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, key, description, color,
                          owner_id AS "ownerId",
                          created_at AS "createdAt",
                          updated_at AS "updatedAt"
            `;
            const projectResult = await client.query(insertProject, [
                data.name,
                data.key,
                data.description || null,
                data.color || '#3730E0',
                userId,
            ]);
            const project = projectResult.rows[0];

            await client.query(
                'INSERT INTO project_members (project_id, user_id) VALUES ($1, $2)',
                [project.id, userId]
            );

            await client.query(
                'INSERT INTO task_counters (project_id, last_number) VALUES ($1, 0)',
                [project.id]
            );

            await client.query('COMMIT');
            return project;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getProjectMembers(projectId) {
        const query = `
            SELECT u.id, u.name, u.initials, u.avatar_color AS "avatarColor", u.role
            FROM project_members pm
            JOIN users u ON u.id = pm.user_id
            WHERE pm.project_id = $1
        `;
        const result = await pool.query(query, [projectId]);
        return result.rows;
    }

    async addProjectMember(projectId, userId) {
        const query = `
            INSERT INTO project_members (project_id, user_id)
            VALUES ($1, $2)
            ON CONFLICT (project_id, user_id) DO NOTHING
            RETURNING
                (SELECT row_to_json(u) FROM (
                    SELECT id, name, initials,
                           avatar_color AS "avatarColor", role
                    FROM users WHERE id = $2
                ) u) AS member
        `;
        const result = await pool.query(query, [projectId, userId]);
        return result.rows[0]?.member ?? null;
    }

    async removeProjectMember(projectId, userId) {
        const query = `
            DELETE FROM project_members
            WHERE project_id = $1 AND user_id = $2
            RETURNING (
                SELECT row_to_json(u) FROM (
                    SELECT u.id, u.name, u.initials,
                           avatar_color AS "avatarColor", role
                    FROM users WHERE id = $2
                ) u) AS member
        `;
        const result = await pool.query(query, [projectId, userId]);
        return result.rows[0] ?? null;
    }

    async getOwnerIdByProjectId(projectId) {
        const query = `
            SELECT owner_id FROM projects WHERE id = $1
        `;
        const result = await pool.query(query, [projectId]);
        return result.rows[0]?.owner_id ?? null;
    }
}
