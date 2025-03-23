import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Snackbar } from 'react-native-paper';
import { router, Link } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { signup } = useAuth();

    const validate = () => {
        if (!name || name.length < 2) {
            setSnackbarMessage('Name must be at least 2 characters');
            setSnackbarVisible(true);
            return false;
        }

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setSnackbarMessage('Please enter a valid email address');
            setSnackbarVisible(true);
            return false;
        }

        if (!password || password.length < 6) {
            setSnackbarMessage('Password must be at least 6 characters');
            setSnackbarVisible(true);
            return false;
        }

        if (password !== confirmPassword) {
            setSnackbarMessage('Passwords do not match');
            setSnackbarVisible(true);
            return false;
        }

        return true;
    };

    const handleSignup = async () => {
        if (!validate()) return;

        Keyboard.dismiss();
        setLoading(true);

        try {
            const result = await signup(name, email, password);

            if (result.success) {
                router.replace('/home');
            } else {
                setSnackbarMessage(result.message);
                setSnackbarVisible(true);
            }
        } catch (error) {
            console.error('Signup error:', error);
            setSnackbarMessage('Network error. Please try again.');
            setSnackbarVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Animatable.View
                        animation="fadeInUp"
                        duration={1000}
                        style={styles.form}
                    >
                        <Text variant="headlineLarge" style={styles.title}>Create Account</Text>
                        <Text variant="bodyLarge" style={styles.subtitle}>
                            Sign up to get started with Task Manager
                        </Text>

                        <TextInput
                            label="Name"
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            mode="outlined"
                        />

                        <TextInput
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            mode="outlined"
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />

                        <TextInput
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            style={styles.input}
                            mode="outlined"
                            right={
                                <TextInput.Icon
                                    icon={showPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowPassword(!showPassword)}
                                />
                            }
                        />

                        <TextInput
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            style={styles.input}
                            mode="outlined"
                            right={
                                <TextInput.Icon
                                    icon={showConfirmPassword ? "eye-off" : "eye"}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                />
                            }
                        />

                        <Button
                            mode="contained"
                            onPress={handleSignup}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                        >
                            Sign Up
                        </Button>

                        <View style={styles.footerContainer}>
                            <Text variant="bodyMedium">Already have an account?</Text>
                            <Link href="/login" asChild>
                                <Button mode="text" compact>Log In</Button>
                            </Link>
                        </View>
                    </Animatable.View>
                </ScrollView>

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
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    form: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: 24,
        opacity: 0.7,
        textAlign: 'center',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 16,
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        paddingVertical: 4,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
});