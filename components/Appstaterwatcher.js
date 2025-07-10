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

    return () => {
      // Compatible con todas las versiones de React Native
      if (typeof subscription?.remove === "function") {
        subscription.remove();
      } else if (typeof subscription === "function") {
        subscription();
      }
    };
  }, []);

  return null;
}