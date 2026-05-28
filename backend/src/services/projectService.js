import ProjectRepository from '../models/projectRepo.js';
import { AppError } from '../utils/AppError.js';

export default class ProjectService {
    constructor() {
        this.projectRepo = new ProjectRepository();
    }

    async getAllProjects(userId, role) {
        const projects = role === 'admin'
            ? await this.projectRepo.findAllProjects()
            : await this.projectRepo.findProjectsByUserId(userId);

        if (projects.length === 0) {
            return [];
        }

        const projectIds = projects.map(p => p.id);
        const allMembers = await this.projectRepo.getProjectMembersByIds(projectIds);

        // group members by projectId
        const membersByProject = {};
        for (const member of allMembers) {
            if (!membersByProject[member.projectId]) {
                membersByProject[member.projectId] = [];
            }
            membersByProject[member.projectId].push({
                id: member.id,
                name: member.name,
                initials: member.initials,
                avatarColor: member.avatarColor,
                role: member.role,
            });
        }

        return projects.map(p => ({
            id: p.id,
            name: p.name,
            key: p.key,
            description: p.description,
            color: p.color,
            ownerId: p.ownerId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            progress: {
                total: parseInt(p.total_tasks) || 0,
                done: parseInt(p.done_tasks) || 0,
            },
            members: membersByProject[p.id] || [],
        }));
    }

    async addMember(projectId, userId) {
        const member = await this.projectRepo.addProjectMember(projectId, userId);
        if (!member) throw new AppError('User is already a member of this project', 409);
        return member;
    }

    async createProject(data, userId) {
        const project = await this.projectRepo.createProject(data, userId).catch(err => {
            if (err.code === '23505') {
                throw new AppError(`Project key '${data.key}' is already in use`, 409);
            }
            throw err;
        });

        const members = await this.projectRepo.getProjectMembers(project.id);

        return {
            id: project.id,
            name: project.name,
            key: project.key,
            description: project.description,
            color: project.color,
            ownerId: project.ownerId,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            progress: { total: 0, done: 0 },
            members: members.map(m => ({
                id: m.id,
                name: m.name,
                initials: m.initials,
                avatarColor: m.avatarColor,
                role: m.role,
            })),
        };
    }
}
