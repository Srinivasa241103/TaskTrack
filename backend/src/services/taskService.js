import TaskRepository from '../models/taskRepo.js';
import { AppError } from '../utils/AppError.js';

export default class TaskService {
    constructor() {
        this.taskRepo = new TaskRepository();
    }

    async getAllTasks(userId, role, filters) {
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
        const isMember = await this.taskRepo.checkMembership(data.projectId, userId);
        if (!isMember) throw new AppError('You are not a member of this project', 403);

        if (data.assignee) {
            const assigneeIsMember = await this.taskRepo.checkMembership(data.projectId, data.assignee);
            if (!assigneeIsMember) throw new AppError('Assignee is not a member of this project', 400);
        }

        return await this.taskRepo.createTask({ ...data, reporterId: userId });
    }

    async updateTask(taskId, patch, userId, role) {
        const task = await this.taskRepo.findTaskById(taskId);
        if (!task) throw new AppError('Task not found', 404);

        if (role !== 'admin') {
            if (task.assignee !== userId) {
                throw new AppError('You are not authorized to update this task', 403);
            }
            const allowedFields = ['status', 'description'];
            const unauthorized = Object.keys(patch).filter(f => !allowedFields.includes(f));
            if (unauthorized.length > 0) {
                throw new AppError('You are not authorized to update this task', 403);
            }
        }

        if (patch.assignee) {
            const assigneeIsMember = await this.taskRepo.checkMembership(task.projectId, patch.assignee);
            if (!assigneeIsMember) throw new AppError('Assignee is not a member of this project', 400);
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

    async deleteTask(taskId, userId, role) {
        if (role !== 'admin') throw new AppError('Only admins can delete tasks', 403);

        const task = await this.taskRepo.findTaskById(taskId);
        if (!task) throw new AppError('Task not found', 404);

        await this.taskRepo.deleteTask(taskId);
    }
}
