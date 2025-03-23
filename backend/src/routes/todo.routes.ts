import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware';
import catchAsync from '../utils/catchAsync';
import TaskController from '@/controllers/todo.controller';

class TaskRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // All task routes require authentication
        // @ts-ignore
        this.router.use(authMiddleware);

        // Task routes
        this.router.post(
            '/',
            catchAsync(TaskController.createTask)
        );

        this.router.get(
            '/',
            catchAsync(TaskController.getAllTasks)
        );

        this.router.get(
            '/:id',
            catchAsync(TaskController.getTaskById)
        );

        this.router.put(
            '/:id',
            catchAsync(TaskController.updateTask)
        );

        this.router.delete(
            '/:id',
            catchAsync(TaskController.deleteTask)
        );

        this.router.patch(
            '/:id/toggle',
            catchAsync(TaskController.toggleTaskStatus)
        );
    }
}

export default new TaskRoutes().router;