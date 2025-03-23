import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function index() {
    return (
        <SafeAreaView style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>index</Text>
        </SafeAreaView>
    )
}