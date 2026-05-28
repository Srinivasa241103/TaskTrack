import UsersRepository from '../models/usersRepo.js';
import { AppError } from '../utils/AppError.js';

export default class UsersService {
    constructor() {
        this.usersRepo = new UsersRepository();
    }

    async getAllUsers() {
        return await this.usersRepo.findAllUsers();
    }

    async getUserById(id) {
        const user = await this.usersRepo.findUserById(id);
        if (!user) throw new AppError('User not found', 404);
        return user;
    }
}
