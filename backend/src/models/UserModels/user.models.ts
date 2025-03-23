import mongoose, { Schema } from 'mongoose';
import { IUser } from './user.interface';

const UserSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                'Please provide a valid email address'
            ]
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters']
        },
        resetPasswordToken: {
            type: String
        },
        resetPasswordExpires: {
            type: Date
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IUser>('User', UserSchema);