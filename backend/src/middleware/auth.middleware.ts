import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModels/user.models";
import logger from "../utils/logger";

interface DecodedToken {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: DecodedToken;
        }
    }
}

const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization required. No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        try {
            // Verify token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || "fallback_secret_not_for_production"
            ) as DecodedToken;

            // Verify if user still exists
            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found or token is invalid",
                });
            }

            // Add user info to request
            req.user = decoded;
            next();
        } catch (error) {
            logger.error("JWT verification failed:", error);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
    } catch (error) {
        logger.error("Auth middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export default authMiddleware;