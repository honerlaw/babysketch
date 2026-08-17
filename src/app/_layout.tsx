import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FBF7F0' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="color/[id]" />
      </Stack>
    </GestureHandlerRootView>
  );
}
