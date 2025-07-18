import { Stack } from 'expo-router';
import { View } from 'react-native';
import { TaskProvider } from './sup/Taskcontext';

export default function RootLayout() {
  return (
    <TaskProvider>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} /> {/* ← esto oculta la flecha */}
      </View>
    </TaskProvider>
  );
}
