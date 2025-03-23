import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import {
    Text,
    Avatar,
    Card,
    Button,
    Divider,
    TextInput,
    Dialog,
    Portal,
    Snackbar,
    IconButton,
    Surface
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
    const { user, logout, updateProfile, changePassword } = useAuth();

    const [editProfileDialogVisible, setEditProfileDialogVisible] = useState(false);
    const [changePasswordDialogVisible, setChangePasswordDialogVisible] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            setSnackbarMessage('Name is required');
            setSnackbarVisible(true);
            return;
        }

        const result = await updateProfile({ name, email });
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);

        if (result.success) {
            setEditProfileDialogVisible(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setSnackbarMessage('All fields are required');
            setSnackbarVisible(true);
            return;
        }

        if (newPassword.length < 6) {
            setSnackbarMessage('New password must be at least 6 characters');
            setSnackbarVisible(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setSnackbarMessage('New passwords do not match');
            setSnackbarVisible(true);
            return;
        }

        const result = await changePassword(currentPassword, newPassword);
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);

        if (result.success) {
            setChangePasswordDialogVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const openEditProfileDialog = () => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        setEditProfileDialogVisible(true);
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Animatable.View animation="fadeIn" duration={1000}>
                        <Surface style={styles.profileHeader}>
                            <Avatar.Text
                                size={80}
                                label={user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                            />
                            <View style={styles.userInfo}>
                                <Text variant="headlineSmall" style={styles.userName}>{user?.name}</Text>
                                <Text variant="bodyMedium">{user?.email}</Text>
                            </View>
                        </Surface>
                    </Animatable.View>

                    <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleLarge" style={styles.sectionTitle}>Account Settings</Text>
                                <Divider style={styles.divider} />

                                <Button
                                    mode="outlined"
                                    icon="account-edit"
                                    style={styles.settingButton}
                                    onPress={openEditProfileDialog}
                                >
                                    Edit Profile
                                </Button>

                                <Button
                                    mode="outlined"
                                    icon="lock-reset"
                                    style={styles.settingButton}
                                    onPress={() => {
                                        setCurrentPassword('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setChangePasswordDialogVisible(true);
                                    }}
                                >
                                    Change Password
                                </Button>

                                <Divider style={styles.divider} />

                                <Button
                                    mode="contained-tonal"
                                    icon="logout"
                                    style={[styles.settingButton, styles.logoutButton]}
                                    onPress={handleLogout}
                                >
                                    Logout
                                </Button>
                            </Card.Content>
                        </Card>
                    </Animatable.View>
                </ScrollView>

                {/* Edit Profile Dialog */}
                <Portal>
                    <Dialog visible={editProfileDialogVisible} onDismiss={() => setEditProfileDialogVisible(false)}>
                        <Dialog.Title>Edit Profile</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                label="Name"
                                value={name}
                                onChangeText={setName}
                                mode="outlined"
                                style={styles.dialogInput}
                            />
                            <TextInput
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                style={styles.dialogInput}
                                disabled
                            />
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setEditProfileDialogVisible(false)}>Cancel</Button>
                            <Button onPress={handleUpdateProfile}>Update</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>

                {/* Change Password Dialog */}
                <Portal>
                    <Dialog visible={changePasswordDialogVisible} onDismiss={() => setChangePasswordDialogVisible(false)}>
                        <Dialog.Title>Change Password</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                label="Current Password"
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                secureTextEntry={!showCurrentPassword}
                                mode="outlined"
                                style={styles.dialogInput}
                                right={
                                    <TextInput.Icon
                                        icon={showCurrentPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                                    />
                                }
                            />
                            <TextInput
                                label="New Password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry={!showNewPassword}
                                mode="outlined"
                                style={styles.dialogInput}
                                right={
                                    <TextInput.Icon
                                        icon={showNewPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowNewPassword(!showNewPassword)}
                                    />
                                }
                            />
                            <TextInput
                                label="Confirm New Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                mode="outlined"
                                style={styles.dialogInput}
                                right={
                                    <TextInput.Icon
                                        icon={showConfirmPassword ? "eye-off" : "eye"}
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    />
                                }
                            />
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setChangePasswordDialogVisible(false)}>Cancel</Button>
                            <Button onPress={handleChangePassword}>Update</Button>
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
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
        elevation: 4,
    },
    userInfo: {
        marginLeft: 20,
    },
    userName: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    divider: {
        marginBottom: 16,
    },
    settingButton: {
        marginBottom: 12,
    },
    logoutButton: {
        backgroundColor: '#ffe4e6',
    },
    dialogInput: {
        marginBottom: 16,
    },
});