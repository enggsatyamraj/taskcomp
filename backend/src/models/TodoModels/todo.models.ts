import mongoose, { Schema } from 'mongoose';
import { ITodo } from './todo.interface';

const TodoSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters']
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true
        },
        status: {
            type: Boolean,
            default: false
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required']
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<ITodo>('Todo', TodoSchema);