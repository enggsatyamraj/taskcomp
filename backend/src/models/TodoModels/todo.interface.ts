import { Document, Types } from 'mongoose';
import { IUser } from '../UserModels/user.interface';

export interface ITodo extends Document {
    title: string;
    description: string;
    user: Types.ObjectId | IUser;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}