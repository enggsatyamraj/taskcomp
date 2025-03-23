import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import UserModel from "../models/UserModels/user.models";
import logger from "../utils/logger";
import { sendEmail } from "../utils/mailer";
import { EmailType } from "../utils/enums";

// Validation Schemas
const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required")
});

const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format")
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters")
});

const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").optional(),
    email: z.string().email("Invalid email format").optional()
}).refine(data => data.name || data.email, {
    message: "At least one field (name or email) is required",
    path: ["name"]
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters")
});

class AuthController {
    static async signup(req: Request, res: Response) {
        try {
            // Validate request body
            const validationResult = signupSchema.safeParse(req.body);

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

            const { name, email, password } = validationResult.data;

            // Check if user already exists
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exists with this email"
                });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create new user
            const user = await UserModel.create({
                name,
                email,
                password: hashedPassword
            });

            // Generate token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET || "fallback_secret_not_for_production",
                { expiresIn: "24h" }
            );

            // Send welcome email
            await sendEmail({
                to: email,
                templateType: EmailType.WELCOME,
                payload: { name }
            });

            // Send response excluding password
            const userObj = user.toObject();
            // @ts-ignore
            delete userObj.password;

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                token,
                user: userObj
            });
        } catch (error) {
            logger.error("Signup error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            // Validate request body
            const validationResult = loginSchema.safeParse(req.body);

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

            const { email, password } = validationResult.data;

            // Find user
            const user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }

            // Generate token
            const token = jwt.sign(
                { userId: user._id, email: user.email },
                process.env.JWT_SECRET || "fallback_secret_not_for_production",
                { expiresIn: "24h" }
            );

            // Send response excluding password
            const userObj = user.toObject();
            // @ts-ignore
            delete userObj.password;

            res.status(200).json({
                success: true,
                message: "Logged in successfully",
                token,
                user: userObj
            });
        } catch (error) {
            logger.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            // Validate request body
            const validationResult = forgotPasswordSchema.safeParse(req.body);

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

            const { email } = validationResult.data;
            logger.info("Forgot password request received", { email });

            const user = await UserModel.findOne({ email });

            // Don't reveal if user exists or not for security reasons
            if (!user) {
                return res.status(200).json({
                    success: true,
                    message: "If your email is registered with us, you will receive a password reset link shortly."
                });
            }

            // Generate reset token
            const resetToken = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET || "fallback_secret_not_for_production",
                { expiresIn: "1h" }
            );

            // Save reset token to user
            await UserModel.findByIdAndUpdate(user._id, {
                $set: {
                    resetPasswordToken: resetToken,
                    resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
                }
            });

            // Reset password URL
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

            // Send password reset email
            await sendEmail({
                to: email,
                templateType: EmailType.RESET_PASSWORD,
                payload: {
                    name: user.name,
                    resetUrl
                },
            });

            return res.status(200).json({
                success: true,
                message: "If your email is registered with us, you will receive a password reset link shortly."
            });
        } catch (error) {
            logger.error("Forgot password error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            // Validate request body
            const validationResult = resetPasswordSchema.safeParse(req.body);

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

            const { token, newPassword } = validationResult.data;

            try {
                // Verify token
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || "fallback_secret_not_for_production"
                ) as { userId: string };

                // Find user with valid token
                const user = await UserModel.findOne({
                    _id: decoded.userId,
                    resetPasswordToken: token,
                    resetPasswordExpires: { $gt: new Date() }
                });

                if (!user) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid or expired reset token. Please request a new one."
                    });
                }

                // Hash new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);

                // Update password and clear reset token fields
                await UserModel.findByIdAndUpdate(user._id, {
                    $set: { password: hashedPassword },
                    $unset: { resetPasswordToken: "", resetPasswordExpires: "" }
                });

                // Send confirmation email
                await sendEmail({
                    to: user.email,
                    templateType: EmailType.PASSWORD_RESET_SUCCESS,
                    payload: {
                        name: user.name
                    },
                });

                return res.status(200).json({
                    success: true,
                    message: "Password reset successfully. Please login with your new password."
                });
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid or expired reset token. Please request a new one."
                });
            }
        } catch (error) {
            logger.error("Reset password error:", error);
            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async getUserProfile(req: Request, res: Response) {
        try {
            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;

            const user = await UserModel.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "User profile fetched successfully",
                user
            });
        } catch (error) {
            logger.error("Get user profile error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            // Validate request body
            const validationResult = updateProfileSchema.safeParse(req.body);

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

            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;
            const { name, email } = validationResult.data;

            // Check if email is already taken by another user
            if (email) {
                const existingUser = await UserModel.findOne({
                    email,
                    _id: { $ne: userId }
                });

                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        message: "Email is already in use by another account"
                    });
                }
            }

            // Update user
            const updateFields: { name?: string; email?: string } = {};
            if (name) updateFields.name = name;
            if (email) updateFields.email = email;

            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $set: updateFields },
                { new: true, runValidators: true }
            ).select("-password -resetPasswordToken -resetPasswordExpires");

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                user: updatedUser
            });
        } catch (error) {
            logger.error("Update profile error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

    static async changePassword(req: Request, res: Response) {
        try {
            // Validate request body
            const validationResult = changePasswordSchema.safeParse(req.body);

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

            // @ts-ignore - userId comes from auth middleware
            const userId = req.user.userId;
            const { currentPassword, newPassword } = validationResult.data;

            // Find user
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Update password
            await UserModel.findByIdAndUpdate(
                userId,
                { $set: { password: hashedPassword } }
            );

            // Send password change notification
            await sendEmail({
                to: user.email,
                templateType: EmailType.PASSWORD_CHANGED,
                payload: {
                    name: user.name
                },
            });

            res.status(200).json({
                success: true,
                message: "Password changed successfully"
            });
        } catch (error) {
            logger.error("Change password error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }
}

export default AuthController;