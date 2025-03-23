import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeLayout() {
    const theme = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.colors.primary,
                tabBarLabelStyle: { fontSize: 12 },
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 10,
                    paddingTop: 5
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="format-list-checks" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}