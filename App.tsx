import 'react-native-reanimated';
import React from 'react';
import { Platform, View } from 'react-native';
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
          {Platform.OS === 'web' ? (
            // Browser demo: keep the phone layout in a centred column no wider than a large phone.
            <View style={{ flex: 1, backgroundColor: '#060607', alignItems: 'center' }}>
              <View style={{ flex: 1, width: '100%', maxWidth: 430, backgroundColor: colors.bg }}>
                <Root />
              </View>
            </View>
          ) : (
            <Root />
          )}
        </GameProvider>
      ) : (
        <View style={{ flex: 1, backgroundColor: colors.bg }} />
      )}
    </SafeAreaProvider>
  );
}
