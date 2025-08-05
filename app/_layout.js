import { Stack } from "expo-router";
import { View } from "react-native";
import { ThemeProvider } from "../components/ThemeContext";
import { TaskProvider } from "./sup/Taskcontext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TaskProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />{" "}
          {/* ← esto oculta la flecha */}
        </View>
      </TaskProvider>
    </ThemeProvider>
  );
}
