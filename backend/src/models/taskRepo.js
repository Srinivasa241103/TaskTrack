import pool from '../config/dbConfig.js';

export default class TaskRepository {

    async findTasksByUserId(userId, filters = {}) {
        const params = [userId];
        const conditions = [];

        let query = `
            SELECT
                t.id, t.key, t.title, t.description,
                t.status, t.priority,
                t.due_date AS due,
                t.labels,
                t.project_id AS "projectId",
                t.assignee_id AS assignee,
                t.reporter_id AS "reporterId",
                t.created_at AS "createdAt",
                t.updated_at AS "updatedAt"
            FROM tasks t
            JOIN project_members pm ON pm.project_id = t.project_id AND pm.user_id = $1
        `;

        if (filters.projectId) {
            params.push(filters.projectId);
            conditions.push(`t.project_id = $${params.length}`);
        }
        if (filters.assignee) {
            const assigneeId = filters.assignee === 'me' ? userId : filters.assignee;
            params.push(assigneeId);
            conditions.push(`t.assignee_id = $${params.length}`);
        }
        if (filters.status) {
            const statuses = filters.status.split(',').map(s => s.trim());
            params.push(statuses);
            conditions.push(`t.status = ANY($${params.length}::task_status[])`);
        }
        if (filters.priority) {
            params.push(filters.priority);
            conditions.push(`t.priority = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY t.created_at DESC';
        const result = await pool.query(query, params);
        return result.rows;
    }

    async findTaskById(id) {
        const result = await pool.query(`
            SELECT
                t.id, t.key, t.title, t.description,
                t.status, t.priority,
                t.due_date AS due,
                t.labels,
                t.project_id AS "projectId",
                t.assignee_id AS assignee,
                t.reporter_id AS "reporterId",
                t.created_at AS "createdAt",
                t.updated_at AS "updatedAt"
            FROM tasks t
            WHERE t.id = $1
        `, [id]);
        return result.rows[0] || null;
    }

    async checkMembership(projectId, userId) {
        const result = await pool.query(
            'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
            [projectId, userId]
        );
        return result.rows.length > 0;
    }

    async createTask(data) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const counterResult = await client.query(
                'UPDATE task_counters SET last_number = last_number + 1 WHERE project_id = $1 RETURNING last_number',
                [data.projectId]
            );
            const lastNumber = counterResult.rows[0].last_number;

            const keyResult = await client.query('SELECT key FROM projects WHERE id = $1', [data.projectId]);
            const projectKey = keyResult.rows[0].key;
            const taskKey = `${projectKey}-${lastNumber}`;

            const taskResult = await client.query(`
                INSERT INTO tasks (key, title, description, status, priority, due_date, labels, project_id, assignee_id, reporter_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING
                    id, key, title, description, status, priority,
                    due_date AS due, labels,
                    project_id AS "projectId",
                    assignee_id AS assignee,
                    reporter_id AS "reporterId",
                    created_at AS "createdAt",
                    updated_at AS "updatedAt"
            `, [
                taskKey,
                data.title,
                data.description || null,
                data.status || 'todo',
                data.priority || 'Urgent',
                data.due || null,
                data.labels || null,
                data.projectId,
                data.assignee || null,
                data.reporterId,
            ]);
            const task = taskResult.rows[0];

            await client.query(
                'INSERT INTO activity_log (task_id, user_id, action, content) VALUES ($1, $2, $3, $4)',
                [task.id, data.reporterId, 'created', 'created this task']
            );

            await client.query('COMMIT');
            return task;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async updateTask(id, fields) {
        const sets = [];
        const params = [];

        if (fields.title !== undefined) {
            params.push(fields.title);
            sets.push(`title = $${params.length}`);
        }
        if (fields.description !== undefined) {
            params.push(fields.description);
            sets.push(`description = $${params.length}`);
        }
        if (fields.status !== undefined) {
            params.push(fields.status);
            sets.push(`status = $${params.length}`);
        }
        if (fields.priority !== undefined) {
            params.push(fields.priority);
            sets.push(`priority = $${params.length}`);
        }
        if ('due' in fields) {
            params.push(fields.due);
            sets.push(`due_date = $${params.length}`);
        }
        if (fields.labels !== undefined) {
            params.push(fields.labels);
            sets.push(`labels = $${params.length}`);
        }
        if ('assignee' in fields) {
            params.push(fields.assignee);
            sets.push(`assignee_id = $${params.length}`);
        }

        params.push(id);
        const result = await pool.query(`
            UPDATE tasks
            SET ${sets.join(', ')}
            WHERE id = $${params.length}
            RETURNING
                id, key, title, description, status, priority,
                due_date AS due, labels,
                project_id AS "projectId",
                assignee_id AS assignee,
                reporter_id AS "reporterId",
                created_at AS "createdAt",
                updated_at AS "updatedAt"
        `, params);
        return result.rows[0] || null;
    }

    async deleteTask(id) {
        await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    }

    async getTaskActivity(taskId) {
        const result = await pool.query(`
            SELECT
                a.id,
                a.user_id AS "userId",
                u.name AS "userName",
                a.action, a.content, a.details,
                a.created_at AS "createdAt"
            FROM activity_log a
            JOIN users u ON u.id = a.user_id
            WHERE a.task_id = $1
            ORDER BY a.created_at DESC
        `, [taskId]);
        return result.rows;
    }

    async logActivity(data) {
        await pool.query(
            'INSERT INTO activity_log (task_id, user_id, action, content, details) VALUES ($1, $2, $3, $4, $5)',
            [data.taskId, data.userId, data.action, data.content, data.details || null]
        );
    }
}
