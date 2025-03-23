import { Request, Response } from "express";
import { z } from "zod";
import TodoModel from "../models/TodoModels/todo.models";
import logger from "../utils/logger";

// Validation Schemas
const createTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    description: z.string().min(1, "Description is required")
});

const updateTaskSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters").optional(),
    description: z.string().min(1, "Description is required").optional(),
    status: z.boolean().optional()
});

class TaskController {
    // Create a new task
    static async createTask(req: Request, res: Response) {
        try {
            // Validate request body
            const validationResult = createTaskSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: validationResult.error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            const { title, description } = validationResult.data;
            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;

            const task = await TodoModel.create({
                title,
                description,
                status: false,
                user: userId
            });

            res.status(201).json({
                success: true,
                message: "Task created successfully",
                task
            });
        } catch (error) {
            logger.error("Create task error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get all tasks for the logged-in user
    static async getAllTasks(req: Request, res: Response) {
        try {
            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;

            const tasks = await TodoModel.find({ user: userId }).sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                message: "Tasks fetched successfully",
                tasks,
                count: tasks.length
            });
        } catch (error) {
            logger.error("Get all tasks error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Get a specific task by ID
    static async getTaskById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;

            const task = await TodoModel.findOne({ _id: id, user: userId });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Task fetched successfully",
                task
            });
        } catch (error) {
            logger.error("Get task by ID error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Update a task
    static async updateTask(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Validate request body
            const validationResult = updateTaskSchema.safeParse(req.body);

            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: validationResult.error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }

            const { title, description, status } = validationResult.data;

            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;

            // Prepare update object
            const updateFields: { title?: string; description?: string; status?: boolean } = {};
            if (title !== undefined) updateFields.title = title;
            if (description !== undefined) updateFields.description = description;
            if (status !== undefined) updateFields.status = status;

            const task = await TodoModel.findOneAndUpdate(
                { _id: id, user: userId },
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Task updated successfully",
                task
            });
        } catch (error) {
            logger.error("Update task error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Delete a task
    static async deleteTask(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;

            const task = await TodoModel.findOneAndDelete({ _id: id, user: userId });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Task deleted successfully"
            });
        } catch (error) {
            logger.error("Delete task error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    // Toggle task status
    static async toggleTaskStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;

            const task = await TodoModel.findOne({ _id: id, user: userId });

            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found"
                });
            }

            task.status = !task.status;
            await task.save();

            res.status(200).json({
                success: true,
                message: `Task marked as ${task.status ? 'completed' : 'incomplete'}`,
                task
            });
        } catch (error) {
            logger.error("Toggle task status error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default TaskController;