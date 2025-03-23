import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/config';

// Define Task interface
interface Task {
    _id: string;
    title: string;
    description: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

// Define the shape of the task context
interface TaskContextType {
    tasks: Task[];
    isLoading: boolean;
    fetchTasks: () => Promise<void>;
    createTask: (title: string, description: string) => Promise<{ success: boolean; message: string; task?: Task }>;
    updateTask: (id: string, updatedTask: { title?: string; description?: string; status?: boolean }) => Promise<{ success: boolean; message: string; task?: Task }>;
    deleteTask: (id: string) => Promise<{ success: boolean; message: string }>;
    toggleTaskStatus: (id: string) => Promise<{ success: boolean; message: string; task?: Task }>;
    getTaskById: (id: string) => Task | undefined;
}

// Create the task context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Create a provider component
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all tasks
    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/todo`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setTasks(data.tasks);
            } else {
                console.error('Error fetching tasks:', data.message);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new task
    const createTask = async (title: string, description: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                return { success: false, message: 'Authentication required' };
            }

            const response = await fetch(`${API_URL}/todo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description }),
            });

            const data = await response.json();

            if (response.ok) {
                // Add new task to state
                setTasks(prevTasks => [data.task, ...prevTasks]);
                return { success: true, message: 'Task created successfully', task: data.task };
            } else {
                return { success: false, message: data.message || 'Failed to create task' };
            }
        } catch (error) {
            console.error('Create task error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Update a task
    const updateTask = async (id: string, updatedTask: { title?: string; description?: string; status?: boolean }) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                return { success: false, message: 'Authentication required' };
            }

            const response = await fetch(`${API_URL}/todo/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTask),
            });

            const data = await response.json();

            if (response.ok) {
                // Update task in state
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task._id === id ? data.task : task
                    )
                );
                return { success: true, message: 'Task updated successfully', task: data.task };
            } else {
                return { success: false, message: data.message || 'Failed to update task' };
            }
        } catch (error) {
            console.error('Update task error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Delete a task
    const deleteTask = async (id: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                return { success: false, message: 'Authentication required' };
            }

            const response = await fetch(`${API_URL}/todo/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Remove task from state
                setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
                return { success: true, message: 'Task deleted successfully' };
            } else {
                return { success: false, message: data.message || 'Failed to delete task' };
            }
        } catch (error) {
            console.error('Delete task error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Toggle task status
    const toggleTaskStatus = async (id: string) => {
        try {
            const token = await AsyncStorage.getItem('userToken');

            if (!token) {
                return { success: false, message: 'Authentication required' };
            }

            const response = await fetch(`${API_URL}/todo/${id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                // Update task status in state
                setTasks(prevTasks =>
                    prevTasks.map(task =>
                        task._id === id ? data.task : task
                    )
                );
                return { success: true, message: data.message, task: data.task };
            } else {
                return { success: false, message: data.message || 'Failed to toggle task status' };
            }
        } catch (error) {
            console.error('Toggle task status error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    };

    // Get task by ID
    const getTaskById = (id: string) => {
        return tasks.find(task => task._id === id);
    };

    // Create the context value
    const value = {
        tasks,
        isLoading,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        getTaskById,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Create a custom hook for using the task context
export const useTask = () => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTask must be used within a TaskProvider');
    }
    return context;
};