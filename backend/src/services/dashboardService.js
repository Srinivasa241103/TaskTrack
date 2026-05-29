import TaskRepository from "../models/taskRepo.js";
import ProjectRepository from "../models/projectRepo.js";
import { AppError } from "../utils/AppError.js";

export default class DashboardService {
    constructor() {
        this.taskRepo = new TaskRepository();
        this.projectRepo = new ProjectRepository();
    }

    async getData(userId) {
        const [userProjectsList, userTasks, statusRows] = await Promise.all([
            this.projectRepo.findProjectsByUserId(userId),
            this.taskRepo.findTasksByUserId(userId),
            this.taskRepo.getUserTaskByStatus(userId),
        ]);

        if (!userProjectsList || !userTasks || !statusRows) {
            throw new AppError('Failed to load dashboard data');
        }

        let totalTasks = 0;
        for (const project of userProjectsList) {
            totalTasks += Number(project.total_tasks) || 0;
        }

        const tasksByStatus = { todo: 0, in_progress: 0, done: 0 };
        for (const row of statusRows) {
            tasksByStatus[row.status] = row.count;
        }

        const perUser = new Map();
        for (const t of userTasks) {
            if (!t.assignee) continue;
            perUser.set(t.assignee, (perUser.get(t.assignee) || 0) + 1);
        }

        const now = new Date();
        const overdueTasks = userTasks.filter(
            (t) => t.status !== 'done' && t.due && new Date(t.due) < now
        ).length;

        return {
            totalTasks,
            myTasks: userTasks.filter((t) => t.assignee === userId).length,
            tasksByStatus,
            tasksPerUser: Array.from(perUser, ([assigneeId, count]) => ({ assigneeId, count })),
            overdueTasks,
        };
    }
}
