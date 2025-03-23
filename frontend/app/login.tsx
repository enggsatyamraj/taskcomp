import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, Snackbar, useTheme } from 'react-native-paper';
import { router, Link } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const { login } = useAuth();
    const theme = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            setSnackbarMessage('Please enter both email and password');
            setSnackbarVisible(true);
            return;
        }

        Keyboard.dismiss();
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                router.replace('/home');
            } else {
                setSnackbarMessage(result.message);
                setSnackbarVisible(true);
            }
        } catch (error) {
            console.error('Login error:', error);
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
                        <Text variant="headlineLarge" style={styles.title}>Welcome Back</Text>
                        <Text variant="bodyLarge" style={styles.subtitle}>
                            Login to continue to Task Manager
                        </Text>

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

                        <Button
                            mode="contained"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                        >
                            Log In
                        </Button>

                        <View style={styles.footerContainer}>
                            <Text variant="bodyMedium">Don't have an account?</Text>
                            <Link href="/signup" asChild>
                                <Button mode="text" compact>Sign Up</Button>
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