import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Box } from '@/components/ui/box'
import { Heading } from '@/components/ui/heading'
import { Button, ButtonText } from '@/components/ui/button'

export default function index() {
    return (
        <SafeAreaView style={{ paddingHorizontal: 20 }}>
            <Box p="$4">
                <Heading size="xl" mb="$4">Welcome to My App</Heading>
                <Button size="md" variant="solid">
                    <ButtonText>Press Me</ButtonText>
                </Button>
            </Box>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>index</Text>
        </SafeAreaView>
    )
}