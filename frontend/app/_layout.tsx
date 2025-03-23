import { View, Text } from 'react-native'
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import React from 'react'
import { Stack } from 'expo-router'
import { config } from '@/components/ui/gluestack-ui-provider/config';

export default function Layout() {
  return (
    // @ts-ignore
    <GluestackUIProvider config={config} mode="light">
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </GluestackUIProvider>
  );
}