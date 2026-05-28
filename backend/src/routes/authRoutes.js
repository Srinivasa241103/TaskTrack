import { Router } from 'express';
import userController from '../controllers/userController.js';

const router = Router();

router.post('/register', userController.signup);
router.post('/login', userController.login);

export default router;
