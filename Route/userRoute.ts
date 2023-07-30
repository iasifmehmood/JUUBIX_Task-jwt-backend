import express, { Router } from 'express';
import { UserController } from '../Controller/userController';
import { verifyJwtMiddleware } from '../Middleware/authMiddleware';

const router: Router = express.Router();

const userController = new UserController();
//method-3
//router.post('/', (req, res) => userController.createUser(req, res));
router.post('/signup', userController.createUser);
router.post('/login', userController.loginUser);

// Protected route (profile) - Requires authentication
router.get('/profile', verifyJwtMiddleware, userController.userProfile);

router.post('/create', verifyJwtMiddleware, userController.createPost);

router.delete('/delete/:id', verifyJwtMiddleware, userController.deletePost);

router.get('/post/:id', verifyJwtMiddleware, userController.getPost);

router.put('/update/:id', verifyJwtMiddleware, userController.updatePost);
export default router;
