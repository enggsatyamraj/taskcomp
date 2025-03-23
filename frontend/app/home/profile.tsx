import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import {
    Text,
    Avatar,
    Card,
    Button,
    Divider,
    TextInput,
    Snackbar,
    IconButton,
    Surface,
    ActivityIndicator
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../context/AuthContext';
import ActionSheet from 'react-native-actions-sheet';

// Skeleton loader for profile
const ProfileSkeleton = () => (
    <View>
        <Animatable.View
            animation="pulse"
            easing="ease-out"
            iterationCount="infinite"
            duration={1500}
            style={styles.profileHeader}
        >
            <View style={styles.skeletonAvatar} />
            <View style={styles.userInfo}>
                <View style={[styles.skeletonText, { width: 150, height: 20 }]} />
                <View style={[styles.skeletonText, { width: 200, marginTop: 8 }]} />
            </View>
        </Animatable.View>

        <Animatable.View
            animation="pulse"
            easing="ease-out"
            iterationCount="infinite"
            duration={1500}
            delay={200}
            style={[styles.card, { height: 200 }]}
        >
            <View style={{ padding: 20 }}>
                <View style={[styles.skeletonText, { width: 200, height: 20 }]} />
                <View style={[styles.skeletonDivider, { marginVertical: 16 }]} />
                <View style={[styles.skeletonButton, { marginBottom: 12 }]} />
                <View style={[styles.skeletonButton, { marginBottom: 12 }]} />
                <View style={[styles.skeletonDivider, { marginVertical: 16 }]} />
                <View style={styles.skeletonButton} />
            </View>
        </Animatable.View>
    </View>
);

export default function ProfileScreen() {
    const { user, logout, updateProfile, changePassword, isLoading } = useAuth();

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
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Action sheet refs
    const editProfileActionSheetRef = useRef(null);
    const changePasswordActionSheetRef = useRef(null);
    const logoutActionSheetRef = useRef(null);

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            setSnackbarMessage('Name is required');
            setSnackbarVisible(true);
            return;
        }

        setIsUpdatingProfile(true);
        const result = await updateProfile({ name, email });
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);
        setIsUpdatingProfile(false);

        if (result.success) {
            editProfileActionSheetRef.current?.hide();
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

        setIsChangingPassword(true);
        const result = await changePassword(currentPassword, newPassword);
        setSnackbarMessage(result.message);
        setSnackbarVisible(true);
        setIsChangingPassword(false);

        if (result.success) {
            changePasswordActionSheetRef.current?.hide();
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const openEditProfileActionSheet = () => {
        setName(user?.name || '');
        setEmail(user?.email || '');
        editProfileActionSheetRef.current?.show();
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        setIsLoggingOut(false);
    };

    if (isLoading) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
                <ProfileSkeleton />
            </ScrollView>
        );
    }

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
                                    onPress={openEditProfileActionSheet}
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
                                        changePasswordActionSheetRef.current?.show();
                                    }}
                                >
                                    Change Password
                                </Button>

                                <Divider style={styles.divider} />

                                <Button
                                    mode="contained-tonal"
                                    icon="logout"
                                    style={[styles.settingButton, styles.logoutButton]}
                                    onPress={() => logoutActionSheetRef.current?.show()}
                                    loading={isLoggingOut}
                                    disabled={isLoggingOut}
                                >
                                    Logout
                                </Button>
                            </Card.Content>
                        </Card>
                    </Animatable.View>
                </ScrollView>

                {/* Edit Profile Action Sheet */}
                <ActionSheet ref={editProfileActionSheetRef} containerStyle={styles.actionSheet}>
                    <View style={styles.actionSheetContent}>
                        <Text style={styles.actionSheetTitle}>Edit Profile</Text>
                        <TextInput
                            label="Name"
                            value={name}
                            onChangeText={text => setName(text)}
                            mode="outlined"
                            style={styles.dialogInput}
                        />
                        <TextInput
                            label="Email"
                            value={email}
                            mode="outlined"
                            style={styles.dialogInput}
                            disabled
                        />
                        <View style={styles.actionButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => editProfileActionSheetRef.current?.hide()}
                                style={styles.actionButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleUpdateProfile}
                                style={styles.actionButton}
                                loading={isUpdatingProfile}
                                disabled={isUpdatingProfile}
                            >
                                Update
                            </Button>
                        </View>
                    </View>
                </ActionSheet>

                {/* Change Password Action Sheet */}
                <ActionSheet ref={changePasswordActionSheetRef} containerStyle={styles.actionSheet}>
                    <View style={styles.actionSheetContent}>
                        <Text style={styles.actionSheetTitle}>Change Password</Text>
                        <TextInput
                            label="Current Password"
                            value={currentPassword}
                            onChangeText={text => setCurrentPassword(text)}
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
                            onChangeText={text => setNewPassword(text)}
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
                            onChangeText={text => setConfirmPassword(text)}
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
                        <View style={styles.actionButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => changePasswordActionSheetRef.current?.hide()}
                                style={styles.actionButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleChangePassword}
                                style={styles.actionButton}
                                loading={isChangingPassword}
                                disabled={isChangingPassword}
                            >
                                Update
                            </Button>
                        </View>
                    </View>
                </ActionSheet>

                {/* Logout Confirmation Action Sheet */}
                <ActionSheet ref={logoutActionSheetRef} containerStyle={styles.actionSheet}>
                    <View style={styles.actionSheetContent}>
                        <Text style={styles.actionSheetTitle}>Logout Confirmation</Text>
                        <Text style={styles.actionSheetMessage}>
                            Are you sure you want to logout?
                        </Text>
                        <View style={styles.actionButtons}>
                            <Button
                                mode="outlined"
                                onPress={() => logoutActionSheetRef.current?.hide()}
                                style={styles.actionButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleLogout}
                                style={[styles.actionButton, styles.logoutActionButton]}
                                loading={isLoggingOut}
                                disabled={isLoggingOut}
                            >
                                Logout
                            </Button>
                        </View>
                    </View>
                </ActionSheet>

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
    actionSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    actionSheetContent: {
        padding: 20,
        paddingBottom: 30,
    },
    actionSheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    actionSheetMessage: {
        fontSize: 16,
        marginBottom: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    actionButton: {
        marginLeft: 10,
    },
    logoutActionButton: {
        backgroundColor: '#FF5252',
    },
    // Skeleton styles
    skeletonText: {
        height: 14,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    skeletonAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E0E0E0',
    },
    skeletonDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        width: '100%',
    },
    skeletonButton: {
        height: 40,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginBottom: 12,
    }
});