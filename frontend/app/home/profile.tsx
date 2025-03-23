import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import {
    Text,
    Avatar,
    Card,
    Button,
    Divider,
    TextInput,
    Snackbar,
    useTheme,
    ActivityIndicator
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../context/AuthContext';
import ActionSheet from 'react-native-actions-sheet';
import { LinearGradient } from 'expo-linear-gradient';

// Skeleton loader for profile
const ProfileSkeleton = () => (
    <View>
        <Animatable.View
            animation="pulse"
            easing="ease-out"
            iterationCount="infinite"
            duration={1500}
            style={styles.profileHeaderSkeleton}
        >
            <View style={styles.skeletonAvatar} />
            <View style={styles.userInfo}>
                <View style={[styles.skeletonText, { width: 150, height: 20, marginBottom: 8 }]} />
                <View style={[styles.skeletonText, { width: 200 }]} />
            </View>
        </Animatable.View>

        <Animatable.View
            animation="pulse"
            easing="ease-out"
            iterationCount="infinite"
            duration={1500}
            delay={200}
            style={[styles.card, { height: 220, marginTop: 16 }]}
        >
            <View style={{ padding: 20 }}>
                <View style={[styles.skeletonText, { width: 150, height: 22, marginBottom: 16 }]} />
                <View style={[styles.skeletonDivider, { marginBottom: 16 }]} />
                <View style={[styles.skeletonButton, { marginBottom: 12 }]} />
                <View style={[styles.skeletonButton, { marginBottom: 12 }]} />
                <View style={[styles.skeletonDivider, { marginVertical: 16 }]} />
                <View style={styles.skeletonButton} />
            </View>
        </Animatable.View>
    </View>
);

export default function ProfileScreen() {
    const theme = useTheme();
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

    // Set status bar style
    StatusBar.setBarStyle('light-content');

    if (isLoading) {
        return (
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                <ProfileSkeleton />
            </ScrollView>
        );
    }

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    // Setup additional data for scroll demo
    const additionalSections = [
        { title: 'Privacy Settings', icon: 'shield-account-outline' },
        { title: 'Appearance', icon: 'palette-outline' },
        { title: 'Notifications', icon: 'bell-outline' },
        { title: 'About App', icon: 'information-outline' }
    ];

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <LinearGradient
                    colors={['#6200ee', '#8e44ad']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContent}>
                        <Animatable.View animation="fadeIn" duration={1000}>
                            <Avatar.Text
                                size={80}
                                label={getInitials(user?.name)}
                                style={styles.avatar}
                                labelStyle={styles.avatarLabel}
                            />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                                <Text style={styles.userEmail}>{user?.email}</Text>
                            </View>
                        </Animatable.View>
                    </View>
                </LinearGradient>

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    overScrollMode="always"
                >
                    <Animatable.View animation="fadeInUp" duration={800} delay={200}>
                        <Card style={styles.card} mode="outlined">
                            <Card.Content>
                                <Text style={styles.sectionTitle}>Account Settings</Text>
                                <Divider style={styles.divider} />

                                <Button
                                    mode="outlined"
                                    icon="account-edit-outline"
                                    style={styles.settingButton}
                                    onPress={openEditProfileActionSheet}
                                    contentStyle={styles.buttonContent}
                                    labelStyle={styles.buttonLabel}
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
                                    contentStyle={styles.buttonContent}
                                    labelStyle={styles.buttonLabel}
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
                                    contentStyle={styles.buttonContent}
                                    labelStyle={styles.buttonLabel}
                                >
                                    Logout
                                </Button>
                            </Card.Content>
                        </Card>
                    </Animatable.View>

                    <Animatable.View animation="fadeInUp" duration={800} delay={400}>
                        <Card style={styles.card} mode="outlined">
                            <Card.Content>
                                <Text style={styles.sectionTitle}>App Information</Text>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Version</Text>
                                    <Text style={styles.infoValue}>1.0.0</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Last Updated</Text>
                                    <Text style={styles.infoValue}>March 24, 2025</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </Animatable.View>

                    {/* Additional sections for scrolling */}
                    {/* {additionalSections.map((section, index) => (
                        <Animatable.View
                            key={section.title}
                            animation="fadeInUp"
                            duration={800}
                            delay={400 + (index * 100)}
                        >
                            <Card style={styles.card} mode="outlined">
                                <Card.Content>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                    <Divider style={styles.divider} />

                                    <Button
                                        mode="outlined"
                                        icon={section.icon}
                                        style={styles.settingButton}
                                        contentStyle={styles.buttonContent}
                                        labelStyle={styles.buttonLabel}
                                    >
                                        View {section.title}
                                    </Button>
                                </Card.Content>
                            </Card>
                        </Animatable.View>
                    ))} */}
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
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <TextInput
                            label="Email"
                            value={email}
                            mode="outlined"
                            style={styles.dialogInput}
                            disabled
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                        />
                        <View style={styles.actionButtons}>
                            <Button
                                mode="text"
                                onPress={() => editProfileActionSheetRef.current?.hide()}
                                style={styles.actionButton}
                                labelStyle={{ fontSize: 16 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleUpdateProfile}
                                style={[styles.actionButton, styles.primaryButton]}
                                loading={isUpdatingProfile}
                                disabled={isUpdatingProfile}
                                labelStyle={{ fontSize: 16 }}
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
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
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
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
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
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                            right={
                                <TextInput.Icon
                                    icon={showConfirmPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            }
                        />
                        <View style={styles.actionButtons}>
                            <Button
                                mode="text"
                                onPress={() => changePasswordActionSheetRef.current?.hide()}
                                style={styles.actionButton}
                                labelStyle={{ fontSize: 16 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleChangePassword}
                                style={[styles.actionButton, styles.primaryButton]}
                                loading={isChangingPassword}
                                disabled={isChangingPassword}
                                labelStyle={{ fontSize: 16 }}
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
                                mode="text"
                                onPress={() => logoutActionSheetRef.current?.hide()}
                                style={styles.actionButton}
                                labelStyle={{ fontSize: 16 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleLogout}
                                style={[styles.actionButton, styles.logoutActionButton]}
                                loading={isLoggingOut}
                                disabled={isLoggingOut}
                                buttonColor={theme.colors.error}
                                labelStyle={{ fontSize: 16 }}
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
                    style={styles.snackbar}
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
        backgroundColor: '#f8f9fa',
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 30,
    },
    headerContent: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    scrollContainer: {
        padding: 16,
        paddingTop: 0,
        paddingBottom: 40,
    },
    avatar: {
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignSelf: 'center',
    },
    avatarLabel: {
        fontSize: 32,
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
    },
    card: {
        borderRadius: 16,
        // marginBottom: 16,
        marginTop: 10,
        elevation: 2,
        borderColor: '#e0e0e0',
        backgroundColor: 'white',
    },
    profileHeaderSkeleton: {
        paddingTop: 50,
        paddingBottom: 30,
        alignItems: 'center',
        backgroundColor: '#8e44ad',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333333',
    },
    divider: {
        marginBottom: 16,
        backgroundColor: '#f0f0f0',
    },
    settingButton: {
        marginBottom: 12,
        borderRadius: 8,
        borderColor: '#e0e0e0',
    },
    buttonContent: {
        height: 48,
    },
    buttonLabel: {
        fontSize: 16,
    },
    logoutButton: {
        backgroundColor: '#ffebee',
    },
    dialogInput: {
        marginBottom: 16,
        backgroundColor: 'white',
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
    logoutActionButton: {
        borderRadius: 8,
    },
    snackbar: {
        bottom: 16,
        borderRadius: 8,
    },
    // Skeleton styles
    skeletonText: {
        height: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
    },
    skeletonAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 12,
        alignSelf: 'center',
    },
    skeletonDivider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        width: '100%',
    },
    skeletonButton: {
        height: 48,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    infoLabel: {
        color: '#555555',
        fontSize: 16,
    },
    infoValue: {
        color: '#333333',
        fontSize: 16,
        fontWeight: '500',
    },
});