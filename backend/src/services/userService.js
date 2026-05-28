import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { generateHash, compareHash } from '../utils/hashing.js';
import UserRepository from '../models/userRepo.js';
import { USER_ROLES } from '../utils/constants.js';
import { AppError } from '../utils/AppError.js';

export default class UserService {
    constructor() {
        this.userRepo = new UserRepository();
    }

    async registerUser({ email, name, password, employeeId = '' }) {
        const existingUser = await this.userRepo.getUserByEmail(email);
        if (existingUser) {
            throw new AppError('User already exists', 409);
        }

        const passwordHash = await generateHash(password);
        const userDetails = {
            email,
            name,
            password: passwordHash,
            role: employeeId ? USER_ROLES.ADMIN : USER_ROLES.MEMBER,
        };

        const createdUser = await this.userRepo.createUser(userDetails);

        const jwtPayload = {
            id: createdUser.id,
            role: createdUser.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            generateAccessToken(jwtPayload),
            generateRefreshToken(jwtPayload),
        ]);

        const stored = await this.userRepo.storeRefreshToken(refreshToken, createdUser.id);
        if (!stored) {
            throw new AppError('Failed to store refresh token', 500);
        }

        return {
            userId: createdUser.id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            accessToken,
            refreshToken,
        };
    }

    async loginUser({ email, password }) {
        const user = await this.userRepo.getUserByEmail(email);
        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        const isPasswordValid = await compareHash(password, user.password_hash);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        const jwtPayload = {
            id: user.id,
            role: user.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            generateAccessToken(jwtPayload),
            generateRefreshToken(jwtPayload),
        ]);

        const stored = await this.userRepo.storeRefreshToken(refreshToken, user.id);
        if (!stored) {
            throw new AppError('Failed to store refresh token', 500);
        }

        return {
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessToken,
            refreshToken,
        };
    }
}
