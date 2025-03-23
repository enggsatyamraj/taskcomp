import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import {
    Text,
    Card,
    Button,
    IconButton,
    FAB,
    TextInput,
    Divider,
    Snackbar,
    ActivityIndicator,
    MD2Colors,
    useTheme
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useTask } from '../../context/TaskContext';
import ActionSheet from 'react-native-actions-sheet';

// Custom checkbox component to ensure visibility
const CustomCheckbox = ({ checked, onPress, isLoading }) => {
    if (isLoading) {
        return <ActivityIndicator size={20} style={{ marginRight: 12 }} />;
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.customCheckbox,
                checked && styles.customCheckboxChecked
            ]}
        >
            {checked && (
                <IconButton
                    icon="check"
                    size={16}
                    iconColor="#fff"
                    style={styles.checkIcon}
                />
            )}
        </TouchableOpacity>
    );
};

// Skeleton component for task loading
const TaskSkeleton = ({ index }) => (
    <Animatable.View
        animation="pulse"
        easing="ease-out"
        iterationCount="infinite"
        duration={1500}
        delay={index * 100}
    >
        <Card style={styles.card} mode="outlined">
            <Card.Content>
                <View style={styles.taskHeader}>
                    <View style={styles.taskTitleContainer}>
                        <View style={[styles.skeletonCircle, { marginRight: 8 }]} />
                        <View style={[styles.skeletonText, { width: '70%' }]} />
                    </View>
                    <View style={styles.taskActions}>
                        <View style={styles.skeletonCircle} />
                        <View style={styles.skeletonCircle} />
                    </View>
                </View>
                <Divider style={styles.divider} />
                <View style={[styles.skeletonText, { width: '90%', marginTop: 8 }]} />
                <View style={[styles.skeletonText, { width: '60%', marginTop: 8 }]} />
            </Card.Content>
        </Card>
    </Animatable.View>
);

export default function HomeScreen() {
    const theme = useTheme();
    const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask, toggleTaskStatus } = useTask();

    // Local state
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(null);

    // Action sheet refs
    const createActionSheetRef = useRef(null);
    const editActionSheetRef = useRef(null);
    const deleteActionSheetRef = useRef(null);

    useEffect(() => {
        fetchTasks();
        // Set status bar style
        StatusBar.setBarStyle('dark-content');
        StatusBar.setBackgroundColor('#f8f9fa');
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTasks();
        setRefreshing(false);
    }, [fetchTasks]);

    const handleCreateTask = async () => {
        if (!title.trim()) {
            setSnackbarMessage('Please enter a title');
            setSnackbarVisible(true);
            return;
        }

        if (!description.trim()) {
            setSnackbarMessage('Please enter a description');
            setSnackbarVisible(true);
            return;
        }

        setIsCreating(true);
        const result = await createTask(title, description);
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);
        setIsCreating(false);

        if (result.success) {
            createActionSheetRef.current?.hide();
            setTitle('');
            setDescription('');
        }
    };

    const handleEditTask = async () => {
        if (!title.trim()) {
            setSnackbarMessage('Please enter a title');
            setSnackbarVisible(true);
            return;
        }

        if (!description.trim()) {
            setSnackbarMessage('Please enter a description');
            setSnackbarVisible(true);
            return;
        }

        setIsUpdating(true);
        const result = await updateTask(selectedTaskId, { title, description });
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);
        setIsUpdating(false);

        if (result.success) {
            editActionSheetRef.current?.hide();
        }
    };

    const handleDeleteTask = async () => {
        setIsDeleting(true);
        const result = await deleteTask(selectedTaskId);
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);
        setIsDeleting(false);

        if (result.success) {
            deleteActionSheetRef.current?.hide();
        }
    };

    const handleToggleStatus = async (id) => {
        setIsTogglingStatus(id);
        await toggleTaskStatus(id);
        setIsTogglingStatus(null);
    };

    const openEditActionSheet = (task) => {
        setSelectedTaskId(task._id);
        setTitle(task.title);
        setDescription(task.description);
        editActionSheetRef.current?.show();
    };

    const openDeleteActionSheet = (id) => {
        setSelectedTaskId(id);
        deleteActionSheetRef.current?.show();
    };

    const renderTaskItem = ({ item, index }) => (
        <Animatable.View
            animation="fadeIn"
            duration={500}
            delay={index * 100}
        >
            <Card
                style={[
                    styles.card,
                    item.status && styles.completedCard
                ]}
                mode="outlined"
            >
                <Card.Content>
                    <View style={styles.taskHeader}>
                        <View style={styles.taskTitleContainer}>
                            <TouchableOpacity
                                onPress={() => handleToggleStatus(item._id)}
                                style={[
                                    styles.customCheckbox,
                                    item.status && styles.customCheckboxChecked
                                ]}
                                disabled={isTogglingStatus === item._id}
                            >
                                {isTogglingStatus === item._id ? (
                                    <ActivityIndicator size={16} color={item.status ? "#fff" : "#6200ee"} />
                                ) : (
                                    item.status && (
                                        <IconButton
                                            icon="check"
                                            size={16}
                                            iconColor="#fff"
                                            style={styles.checkIcon}
                                        />
                                    )
                                )}
                            </TouchableOpacity>
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
                                icon="pencil-outline"
                                iconColor={theme.colors.primary}
                                size={18}
                                onPress={() => openEditActionSheet(item)}
                                style={styles.actionIcon}
                            />
                            <IconButton
                                icon="trash-can-outline"
                                iconColor={theme.colors.error}
                                size={18}
                                onPress={() => openDeleteActionSheet(item._id)}
                                style={styles.actionIcon}
                            />
                        </View>
                    </View>
                    <Divider style={styles.divider} />
                    <Text
                        variant="bodyMedium"
                        style={[
                            styles.taskDescription,
                            item.status && styles.completedTask
                        ]}
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
                        Create your first task by tapping the + button
                    </Text>
                </Animatable.View>
            )}
        </View>
    );

    // Skeleton loader during initial loading
    const renderSkeletons = () => {
        return Array(3)
            .fill()
            .map((_, index) => <TaskSkeleton key={index} index={index} />);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
                <Text style={styles.headerSubtitle}>
                    {tasks.filter(task => !task.status).length} remaining
                </Text>
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.listContent}>
                    {renderSkeletons()}
                </View>
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={renderTaskItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[theme.colors.primary]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => {
                    setTitle('');
                    setDescription('');
                    createActionSheetRef.current?.show();
                }}
                color="#fff"
            />

            {/* Create Task Action Sheet */}
            <ActionSheet ref={createActionSheetRef} containerStyle={styles.actionSheet}>
                <View style={styles.actionSheetContent}>
                    <Text style={styles.actionSheetTitle}>New Task</Text>
                    <TextInput
                        label="Title"
                        value={title}
                        onChangeText={text => setTitle(text)}
                        mode="outlined"
                        style={styles.dialogInput}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                    />
                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={text => setDescription(text)}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.dialogInput}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                    />
                    <View style={styles.actionButtons}>
                        <Button
                            mode="text"
                            onPress={() => createActionSheetRef.current?.hide()}
                            style={styles.actionButton}
                            labelStyle={{ fontSize: 16 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleCreateTask}
                            style={[styles.actionButton, styles.primaryButton]}
                            loading={isCreating}
                            disabled={isCreating}
                            labelStyle={{ fontSize: 16 }}
                        >
                            Create
                        </Button>
                    </View>
                </View>
            </ActionSheet>

            {/* Edit Task Action Sheet */}
            <ActionSheet ref={editActionSheetRef} containerStyle={styles.actionSheet}>
                <View style={styles.actionSheetContent}>
                    <Text style={styles.actionSheetTitle}>Edit Task</Text>
                    <TextInput
                        label="Title"
                        value={title}
                        onChangeText={text => setTitle(text)}
                        mode="outlined"
                        style={styles.dialogInput}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                    />
                    <TextInput
                        label="Description"
                        value={description}
                        onChangeText={text => setDescription(text)}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                        style={styles.dialogInput}
                        outlineColor={theme.colors.outline}
                        activeOutlineColor={theme.colors.primary}
                    />
                    <View style={styles.actionButtons}>
                        <Button
                            mode="text"
                            onPress={() => editActionSheetRef.current?.hide()}
                            style={styles.actionButton}
                            labelStyle={{ fontSize: 16 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleEditTask}
                            style={[styles.actionButton, styles.primaryButton]}
                            loading={isUpdating}
                            disabled={isUpdating}
                            labelStyle={{ fontSize: 16 }}
                        >
                            Update
                        </Button>
                    </View>
                </View>
            </ActionSheet>

            {/* Delete Task Action Sheet */}
            <ActionSheet ref={deleteActionSheetRef} containerStyle={styles.actionSheet}>
                <View style={styles.actionSheetContent}>
                    <Text style={styles.actionSheetTitle}>Delete Task</Text>
                    <Text style={styles.actionSheetMessage}>
                        Are you sure you want to delete this task?
                    </Text>
                    <View style={styles.actionButtons}>
                        <Button
                            mode="text"
                            onPress={() => deleteActionSheetRef.current?.hide()}
                            style={styles.actionButton}
                            labelStyle={{ fontSize: 16 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleDeleteTask}
                            style={[styles.actionButton, styles.deleteButton]}
                            loading={isDeleting}
                            disabled={isDeleting}
                            labelStyle={{ fontSize: 16 }}
                            buttonColor={theme.colors.error}
                        >
                            Delete
                        </Button>
                    </View>
                </View>
            </ActionSheet>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
                style={styles.snackbar}
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
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#f8f9fa',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6c757d',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
        elevation: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#ffffff',
    },
    completedCard: {
        backgroundColor: '#f9f9f9',
        borderColor: '#e0e0e0',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    taskTitle: {
        fontWeight: '500',
        marginLeft: 12,
        flex: 1,
        color: '#333333',
    },
    taskDescription: {
        color: '#555555',
    },
    completedTask: {
        textDecorationLine: 'line-through',
        color: '#9e9e9e',
    },
    taskActions: {
        flexDirection: 'row',
    },
    actionIcon: {
        margin: 0,
        marginLeft: 4,
    },
    divider: {
        marginVertical: 10,
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#6200ee',
        borderRadius: 30,
    },
    dialogInput: {
        marginBottom: 16,
        backgroundColor: '#ffffff',
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
        color: '#6c757d',
    },
    emptySubText: {
        opacity: 0.7,
        textAlign: 'center',
        // paddingHorizontal: 20,
        color: '#6c757d',
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
    actionSheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    actionSheetContent: {
        padding: 24,
        paddingBottom: 36,
    },
    actionSheetTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333333',
    },
    actionSheetMessage: {
        fontSize: 16,
        marginBottom: 20,
        color: '#555555',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
    },
    actionButton: {
        marginLeft: 12,
    },
    primaryButton: {
        borderRadius: 8,
    },
    deleteButton: {
        borderRadius: 8,
    },
    snackbar: {
        bottom: 16,
        borderRadius: 8,
    },
    // Custom checkbox styles
    customCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#6200ee',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    customCheckboxChecked: {
        backgroundColor: '#6200ee',
    },
    checkIcon: {
        margin: 0,
        padding: 0,
        width: 16,
        height: 16,
    },
    // Skeleton styles
    skeletonText: {
        height: 14,
        backgroundColor: '#f0f0f0',
        borderRadius: 4,
    },
    skeletonCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#f0f0f0',
        marginHorizontal: 4,
    },
});