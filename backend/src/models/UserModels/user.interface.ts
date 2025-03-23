import { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: string;
    updatedAt: string;
}