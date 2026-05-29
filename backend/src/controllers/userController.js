import UserService from '../services/userService.js';
import { AppError } from '../utils/AppError.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
};

const setAuthCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 1000, // 1 day
    });
    res.cookie('refreshToken', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/api/v1',
    });
};

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    signup = async (req, res) => {
        try {
            const { email, password, name, employeeId } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'name, email, and password are required',
                });
            }
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters',
                });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email address',
                });
            }

            const result = await this.userService.registerUser({
                email,
                password,
                name,
                employeeId,
            });

            setAuthCookies(res, result.accessToken, result.refreshToken);

            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    userId: result.userId,
                    name: result.name,
                    email: result.email,
                    role: result.role,
                    accessToken: result.accessToken,
                },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };

    login = async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'email and password are required',
                });
            }

            const result = await this.userService.loginUser({ email, password });

            setAuthCookies(res, result.accessToken, result.refreshToken);

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    userId: result.userId,
                    name: result.name,
                    email: result.email,
                    role: result.role,
                    accessToken: result.accessToken,
                },
            });
        } catch (err) {
            const status = err instanceof AppError ? err.statusCode : 500;
            const message = err instanceof AppError ? err.message : 'Internal server error';
            return res.status(status).json({ success: false, message });
        }
    };
}

export default new UserController();
