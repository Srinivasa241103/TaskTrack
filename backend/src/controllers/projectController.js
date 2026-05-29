import ProjectService from '../services/projectService.js';
import ProjectRepository from '../models/projectRepo.js';
import { AppError } from '../utils/AppError.js';

export default class Projects {
    constructor() {
        this.projectService = new ProjectService();
        this.projectRepo = new ProjectRepository();
    }

    getProjects = async (req, res) => {
        try {
            const { userId } = req.user;
            const projects = await this.projectService.getAllProjects(userId);
            return res.status(200).json({
                success: true,
                message: 'Projects fetched successfully',
                data: { projects, count: projects.length },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    addMember = async (req, res) => {
        try {
            const { id: projectId } = req.params;
            const { userId: memberToAdd } = req.body;
            const { userId: currentUserId } = req.user;

            if (!memberToAdd) {
                return res.status(400).json({ success: false, message: 'userId is required' });
            }

            // Only the project owner (admin of this project) can add members
            const ownerId = await this.projectRepo.getOwnerIdByProjectId(projectId);
            if (ownerId !== currentUserId) {
                return res.status(403).json({ success: false, message: 'Only the project admin (creator) can add members' });
            }

            const member = await this.projectService.addMember(projectId, memberToAdd);
            return res.status(200).json({
                success: true,
                message: 'Member added successfully',
                data: { member },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    removeMember = async (req, res) => {
        try {
            const { id: projectId } = req.params;
            const { userId: memberToRemove } = req.body;
            const { userId: currentUserId } = req.user;

            if (!memberToRemove) {
                return res.status(400).json({ success: false, message: 'userId is required' });
            }

            // Only the project owner (admin of this project) can remove members
            const ownerId = await this.projectRepo.getOwnerIdByProjectId(projectId);
            if (ownerId !== currentUserId) {
                return res.status(403).json({ success: false, message: 'Only the project admin (creator) can remove members' });
            }

            // Prevent the owner from removing themselves
            if (memberToRemove === ownerId) {
                return res.status(400).json({ success: false, message: 'Project admin cannot remove themselves' });
            }

            await this.projectService.removeMember(projectId, memberToRemove);
            return res.status(200).json({
                success: true,
                message: 'Member removed successfully',
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    createProject = async (req, res) => {
        try {
            const { userId } = req.user;
            // Any authenticated user can create a project — they become the project admin (owner)
            const { name, description, color, key } = req.body;
            if (!name || !key) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide project name and key'
                });
            }
            if (!/^[A-Z][A-Z0-9]{1,9}$/.test(key)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid project key. Use 2–10 uppercase letters/numbers (e.g. WEB)'
                });
            }
            const projectDetails = {
                name,
                description,
                color,
                key,
            };

            const project = await this.projectService.createProject(projectDetails, userId);
            return res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: { project },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };
}
