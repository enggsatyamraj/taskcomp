import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, ActivityIndicator, MD3Colors } from 'react-native-paper';
import { router } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Wait a bit for better UX
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check if user is logged in
                const token = await AsyncStorage.getItem('userToken');

                if (token) {
                    // User is logged in, navigate to home
                    router.replace('/home');
                } else {
                    // User is not logged in, navigate to login
                    router.replace('/login');
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                // If there's an error, direct to login screen
                router.replace('/login');
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <View style={styles.container}>
            <Animatable.View animation="bounceIn" duration={1500}>
                <Image
                    source={require('../assets/images/icon.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animatable.View>

            <Animatable.View animation="fadeInUp" delay={300} duration={1000}>
                <Text variant="headlineLarge" style={styles.title}>
                    Task Manager
                </Text>
            </Animatable.View>

            <Animatable.View animation="fadeIn" delay={800} duration={1000}>
                <ActivityIndicator animating={true} color={MD3Colors.primary50} size="large" style={styles.loader} />
            </Animatable.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
    },
    title: {
        marginBottom: 30,
        color: '#1a1a1a',
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 20,
    },
});