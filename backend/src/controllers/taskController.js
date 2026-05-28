import TaskService from '../services/taskService.js';
import { AppError } from '../utils/AppError.js';

class TaskController {
    constructor() {
        this.taskService = new TaskService();
    }

    getTasks = async (req, res) => {
        try {
            const { userId, role } = req.user;
            const { projectId, assignee, status, priority } = req.query;
            const tasks = await this.taskService.getAllTasks(userId, role, { projectId, assignee, status, priority });
            return res.status(200).json({
                success: true,
                message: 'Tasks fetched successfully',
                data: { tasks, count: tasks.length },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    getTaskById = async (req, res) => {
        try {
            const { userId } = req.user;
            const { id } = req.params;
            const { task, activity } = await this.taskService.getTaskById(id, userId);
            return res.status(200).json({
                success: true,
                message: 'Task fetched successfully',
                data: { task, activity },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    createTask = async (req, res) => {
        try {
            const { userId } = req.user;
            const { title, projectId, description, assignee, priority, due, labels, status } = req.body;

            if (!title || title.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Task title is required' });
            }
            if (!projectId) {
                return res.status(400).json({ success: false, message: 'projectId is required' });
            }
            if (priority && !['Critical', 'Urgent', 'Required'].includes(priority)) {
                return res.status(400).json({ success: false, message: 'Invalid priority. Must be Critical, Urgent, or Required' });
            }
            if (status && !['todo', 'in_progress', 'done'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status. Must be todo, in_progress, or done' });
            }

            const task = await this.taskService.createTask(
                { title: title.trim(), projectId, description, assignee, priority, due, labels, status },
                userId
            );
            return res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: { task },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    updateTask = async (req, res) => {
        try {
            const { userId, role } = req.user;
            const { id } = req.params;
            const { title, description, status, priority, assignee, due, labels } = req.body;

            const patch = {};
            if (title !== undefined) patch.title = title;
            if (description !== undefined) patch.description = description;
            if (status !== undefined) patch.status = status;
            if (priority !== undefined) patch.priority = priority;
            if ('assignee' in req.body) patch.assignee = assignee;
            if ('due' in req.body) patch.due = due;
            if (labels !== undefined) patch.labels = labels;

            if (patch.status && !['todo', 'in_progress', 'done'].includes(patch.status)) {
                return res.status(400).json({ success: false, message: 'Invalid status. Must be todo, in_progress, or done' });
            }
            if (patch.priority && !['Critical', 'Urgent', 'Required'].includes(patch.priority)) {
                return res.status(400).json({ success: false, message: 'Invalid priority. Must be Critical, Urgent, or Required' });
            }

            const task = await this.taskService.updateTask(id, patch, userId, role);
            return res.status(200).json({
                success: true,
                message: 'Task updated successfully',
                data: { task },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    deleteTask = async (req, res) => {
        try {
            const { userId, role } = req.user;
            const { id } = req.params;
            await this.taskService.deleteTask(id, userId, role);
            return res.status(200).json({
                success: true,
                message: 'Task deleted successfully',
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };
}

export default new TaskController();
