import { Router } from 'express';
import UsersController from '../controllers/usersController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const users = new UsersController();
const router = Router();

router.get('/', authMiddleware, users.getUsers);
router.get('/:id', authMiddleware, users.getUser);

export default router;
