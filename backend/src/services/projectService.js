import ProjectRepository from '../models/projectRepo.js';
import { AppError } from '../utils/AppError.js';

export default class ProjectService {
    constructor() {
        this.projectRepo = new ProjectRepository();
    }

    async getAllProjects(userId) {
        // Every user (including project owners) only sees projects they are a member of.
        // The project creator is auto-added as a member during creation.
        const projects = await this.projectRepo.findProjectsByUserId(userId);

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

        return projects.map(p => {
            const members = membersByProject[p.id] || [];
            const owner = members.find(m => m.id === p.ownerId);
            return {
                id: p.id,
                name: p.name,
                key: p.key,
                description: p.description,
                color: p.color,
                ownerId: p.ownerId,
                ownerName: owner?.name ?? null,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                progress: {
                    total: parseInt(p.total_tasks) || 0,
                    done: parseInt(p.done_tasks) || 0,
                },
                members,
            };
        });
    }

    async addMember(projectId, userId) {
        const member = await this.projectRepo.addProjectMember(projectId, userId);
        if (!member) throw new AppError('User is already a member of this project', 409);
        return member;
    }

    async removeMember(projectId, userId) {
        const member = await this.projectRepo.removeProjectMember(projectId, userId);
        if (!member) throw new AppError('User is not a member of this project', 404);
        return member;
    }
    async createProject(data, userId) {
        const project = await this.projectRepo.createProject(data, userId);

        const members = await this.projectRepo.getProjectMembers(project.id);
        const memberList = members.map(m => ({
            id: m.id,
            name: m.name,
            initials: m.initials,
            avatarColor: m.avatarColor,
            role: m.role,
        }));
        const owner = memberList.find(m => m.id === project.ownerId);

        return {
            id: project.id,
            name: project.name,
            key: project.key,
            description: project.description,
            color: project.color,
            ownerId: project.ownerId,
            ownerName: owner?.name ?? null,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            progress: { total: 0, done: 0 },
            members: memberList,
        };
    }
}
