import 'react-native-reanimated';
import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider } from './src/store/GameContext';
import { Root } from './src/Root';
import { colors, fontAssets } from './src/theme/tokens';

export default function App() {
  const [loaded] = useFonts(fontAssets);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {loaded ? (
        <GameProvider>
          <Root />
        </GameProvider>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.bg }} />
      )}
    </SafeAreaProvider>
  );
}
