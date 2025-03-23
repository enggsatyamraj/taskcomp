import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import authMiddleware from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';

class AuthRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Public routes
        this.router.post(
            '/signup',
            catchAsync(AuthController.signup)
        );

        this.router.post(
            '/login',
            catchAsync(AuthController.login)
        );

        this.router.post(
            '/forgot-password',
            catchAsync(AuthController.forgotPassword)
        );

        this.router.post(
            '/reset-password',
            catchAsync(AuthController.resetPassword)
        );

        // Protected routes (require authentication)
        this.router.get(
            '/profile',
            // @ts-ignore
            authMiddleware,
            catchAsync(AuthController.getUserProfile)
        );

        this.router.put(
            '/profile',
            // @ts-ignore
            authMiddleware,
            catchAsync(AuthController.updateProfile)
        );

        this.router.put(
            '/change-password',
            // @ts-ignore
            authMiddleware,
            catchAsync(AuthController.changePassword)
        );
    }
}

export default new AuthRoutes().router;