import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
    Text,
    Card,
    Button,
    IconButton,
    FAB,
    Portal,
    Dialog,
    TextInput,
    Checkbox,
    Divider,
    Snackbar,
    ActivityIndicator
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useTask } from '../../context/TaskContext';

export default function HomeScreen() {
    const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask, toggleTaskStatus } = useTask();

    // Local state
    const [refreshing, setRefreshing] = useState(false);
    const [createDialogVisible, setCreateDialogVisible] = useState(false);
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTasks();
        setRefreshing(false);
    }, [fetchTasks]);

    const handleCreateTask = async () => {
        if (!title.trim() || !description.trim()) {
            setSnackbarMessage('Please enter both title and description');
            setSnackbarVisible(true);
            return;
        }

        const result = await createTask(title, description);
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);

        if (result.success) {
            setCreateDialogVisible(false);
            setTitle('');
            setDescription('');
        }
    };

    const handleEditTask = async () => {
        if (!title.trim() || !description.trim()) {
            setSnackbarMessage('Please enter both title and description');
            setSnackbarVisible(true);
            return;
        }

        const result = await updateTask(selectedTaskId, { title, description });
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);

        if (result.success) {
            setEditDialogVisible(false);
        }
    };

    const handleDeleteTask = async () => {
        const result = await deleteTask(selectedTaskId);
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);

        if (result.success) {
            setDeleteDialogVisible(false);
        }
    };

    const handleToggleStatus = async (id) => {
        await toggleTaskStatus(id);
    };

    const openEditDialog = (task) => {
        setSelectedTaskId(task._id);
        setTitle(task.title);
        setDescription(task.description);
        setEditDialogVisible(true);
    };

    const openDeleteDialog = (id) => {
        setSelectedTaskId(id);
        setDeleteDialogVisible(true);
    };

    const renderTaskItem = ({ item, index }) => (
        <Animatable.View
            animation="fadeIn"
            duration={500}
            delay={index * 100}
        >
            <Card style={styles.card} mode="outlined">
                <Card.Content>
                    <View style={styles.taskHeader}>
                        <View style={styles.taskTitleContainer}>
                            <Checkbox
                                status={item.status ? 'checked' : 'unchecked'}
                                onPress={() => handleToggleStatus(item._id)}
                            />
                            <Text
                                variant="titleMedium"
                                style={[
                                    styles.taskTitle,
                                    item.status && styles.completedTask
                                ]}
                                numberOfLines={1}
                            >
                                {item.title}
                            </Text>
                        </View>
                        <View style={styles.taskActions}>
                            <IconButton
                                icon="pencil"
                                size={20}
                                onPress={() => openEditDialog(item)}
                            />
                            <IconButton
                                icon="delete"
                                size={20}
                                onPress={() => openDeleteDialog(item._id)}
                            />
                        </View>
                    </View>
                    <Divider style={styles.divider} />
                    <Text
                        variant="bodyMedium"
                        style={item.status && styles.completedTask}
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>
                </Card.Content>
            </Card>
        </Animatable.View>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            {!isLoading && (
                <Animatable.View animation="fadeIn" duration={1000}>
                    <Text style={styles.emptyText}>No tasks yet</Text>
                    <Text style={styles.emptySubText}>
                        Create your first task by clicking the + button below
                    </Text>
                </Animatable.View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                renderItem={renderTaskItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />

            {isLoading && !refreshing && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            )}

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => {
                    setTitle('');
                    setDescription('');
                    setCreateDialogVisible(true);
                }}
            />

            {/* Create Task Dialog */}
            <Portal>
                <Dialog visible={createDialogVisible} onDismiss={() => setCreateDialogVisible(false)}>
                    <Dialog.Title>Create New Task</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Title"
                            value={title}
                            onChangeText={setTitle}
                            mode="outlined"
                            style={styles.dialogInput}
                        />
                        <TextInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.dialogInput}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setCreateDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleCreateTask}>Create</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Edit Task Dialog */}
            <Portal>
                <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
                    <Dialog.Title>Edit Task</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            label="Title"
                            value={title}
                            onChangeText={setTitle}
                            mode="outlined"
                            style={styles.dialogInput}
                        />
                        <TextInput
                            label="Description"
                            value={description}
                            onChangeText={setDescription}
                            mode="outlined"
                            multiline
                            numberOfLines={3}
                            style={styles.dialogInput}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleEditTask}>Update</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Delete Task Dialog */}
            <Portal>
                <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
                    <Dialog.Title>Delete Task</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">Are you sure you want to delete this task?</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
                        <Button onPress={handleDeleteTask}>Delete</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                action={{
                    label: 'Close',
                    onPress: () => setSnackbarVisible(false),
                }}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 12,
        borderRadius: 8,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    taskTitle: {
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },
    completedTask: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    taskActions: {
        flexDirection: 'row',
    },
    divider: {
        marginBottom: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    dialogInput: {
        marginBottom: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptySubText: {
        opacity: 0.7,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
    },
});