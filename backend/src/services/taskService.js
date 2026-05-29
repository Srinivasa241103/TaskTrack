import TaskRepository from '../models/taskRepo.js';
import ProjectRepository from '../models/projectRepo.js';
import { AppError } from '../utils/AppError.js';

export default class TaskService {
    constructor() {
        this.taskRepo = new TaskRepository();
        this.projectRepo = new ProjectRepository();
    }

    async getAllTasks(userId, filters) {
        return await this.taskRepo.findTasksByUserId(userId, filters);
    }

    async getTaskById(taskId, userId) {
        const task = await this.taskRepo.findTaskById(taskId);
        if (!task) throw new AppError('Task not found', 404);

        const isMember = await this.taskRepo.checkMembership(task.projectId, userId);
        if (!isMember) throw new AppError('Task not found', 404);

        const activity = await this.taskRepo.getTaskActivity(taskId);
        return { task, activity };
    }

    async createTask(data, userId) {
        // Only the project admin (owner) can create tasks
        const ownerId = await this.projectRepo.getOwnerIdByProjectId(data.projectId);
        if (!ownerId) throw new AppError('Project not found', 404);
        if (ownerId !== userId) {
            throw new AppError('Only the project admin (creator) can create tasks', 403);
        }

        if (data.assignee) {
            const assigneeIsMember = await this.taskRepo.checkMembership(data.projectId, data.assignee);
            if (!assigneeIsMember) throw new AppError('Assignee is not a member of this project', 400);
        }

        return await this.taskRepo.createTask({ ...data, reporterId: userId });
    }

    async updateTask(taskId, patch, userId) {
        const task = await this.taskRepo.findTaskById(taskId);
        if (!task) throw new AppError('Task not found', 404);

        // Check if the user is the project admin (owner)
        const ownerId = await this.projectRepo.getOwnerIdByProjectId(task.projectId);
        const isProjectAdmin = ownerId === userId;

        if (!isProjectAdmin) {
            // Members can only update tasks assigned to them
            if (task.assignee !== userId) {
                throw new AppError('You can only update tasks assigned to you', 403);
            }
            // Members can only change the status (not title, priority, assignee, etc.)
            const allowedFields = ['status'];
            const unauthorized = Object.keys(patch).filter(f => !allowedFields.includes(f));
            if (unauthorized.length > 0) {
                throw new AppError('Members can only update the status of their assigned tasks', 403);
            }
        }

        if (patch.assignee) {
            const assigneeIsMember = await this.taskRepo.checkMembership(task.projectId, patch.assignee);
            if (!assigneeIsMember) throw new AppError('Assignee is not a member of this project', 400);
        }

        if (patch.status) {
            const order = { todo: 0, in_progress: 1, done: 2 };
            if (order[patch.status] < order[task.status]) {
                throw new AppError('Status can only move forward (To Do → In Progress → Done)', 400);
            }
        }

        const oldStatus = task.status;
        const oldAssignee = task.assignee;

        const updatedTask = await this.taskRepo.updateTask(taskId, patch);

        if (patch.status && patch.status !== oldStatus) {
            await this.taskRepo.logActivity({
                taskId,
                userId,
                action: 'status_change',
                content: `changed status from ${oldStatus} to ${patch.status}`,
                details: JSON.stringify({ from: oldStatus, to: patch.status }),
            });
        }

        if ('assignee' in patch && patch.assignee !== oldAssignee) {
            await this.taskRepo.logActivity({
                taskId,
                userId,
                action: 'assignee_change',
                content: 'assignee changed',
                details: JSON.stringify({ from: oldAssignee, to: patch.assignee }),
            });
        }

        return updatedTask;
    }

    async deleteTask(taskId, userId) {
        const task = await this.taskRepo.findTaskById(taskId);
        if (!task) throw new AppError('Task not found', 404);

        // Only the project admin (owner) can delete tasks
        const ownerId = await this.projectRepo.getOwnerIdByProjectId(task.projectId);
        if (ownerId !== userId) {
            throw new AppError('Only the project admin (creator) can delete tasks', 403);
        }

        await this.taskRepo.deleteTask(taskId);
    }
}
