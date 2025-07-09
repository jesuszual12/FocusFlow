import { useEffect } from "react";
import { Alert, AppState } from "react-native";

export default function AppStateWatcher() {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "background") {
        Alert.alert(
          "¡Vuelve a concentrarte!",
          "Recuerda que estás en modo concentración."
        );
      }
    });

    return () => subscription.remove();
  }, []);

  return null;
}