import UsersService from '../services/usersService.js';
import { AppError } from '../utils/AppError.js';

export default class UsersController {
    constructor() {
        this.usersService = new UsersService();
    }

    getUsers = async (req, res) => {
        try {
            const users = await this.usersService.getAllUsers();
            return res.status(200).json({
                success: true,
                message: 'Users fetched successfully',
                data: users,
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    getUser = async (req, res) => {
        try {
            const { id } = req.params;
            const user = await this.usersService.getUserById(id);
            return res.status(200).json({
                success: true,
                message: 'User fetched successfully',
                data: user,
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };
}
