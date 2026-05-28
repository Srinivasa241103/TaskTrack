import ProjectService from '../services/projectService.js';
import { AppError } from '../utils/AppError.js';

export default class Projects {
    constructor() {
        this.projectService = new ProjectService();
    }

    getProjects = async (req, res) => {
        try {
            const { userId, role } = req.user;
            const projects = await this.projectService.getAllProjects(userId, role);
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
            const { userId } = req.body;
            const { role } = req.user;

            if (role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Only admins can add members' });
            }
            if (!userId) {
                return res.status(400).json({ success: false, message: 'userId is required' });
            }

            const member = await this.projectService.addMember(projectId, userId);
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

    createProject = async (req, res) => {
        try {
            const { userId, role } = req.user;
            if (role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to create a project'
                });
            }
            const { name, description, color, key } = req.body;
            if (!name || !key) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide project name and key'
                });
            }
            if (!key || !/^[A-Z]+-[A-Z0-9 ]{2,10}$/.test(key)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid project key'
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
