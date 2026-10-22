import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from '../design/store';

export default function RootLayout() {
  const { getColors, themeMode } = useThemeStore();
  const colors = getColors();

  return (
    <SafeAreaProvider
      accessible
      accessibilityLabel="KRNL Core Root Application"
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <StatusBar style={themeMode === 'light' ? 'dark' : 'light'} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
});
