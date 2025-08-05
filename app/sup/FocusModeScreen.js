import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../components/ThemeContext'; // 1. Importa el hook

export default function FocusMode() {
  const router = useRouter();
  const { duration, taskName } = useLocalSearchParams();
  const [timeLeft, setTimeLeft] = useState(Number(duration) * 60);
  const { theme } = useTheme(); // 2. Usa el tema

  // Bloquea botón atrás en Android
  useEffect(() => {
    const handler = () => {
      Alert.alert('Salir del modo sin distracciones', '¿Seguro que quieres salir?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: () => router.back() },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => backHandler.remove();
  }, []);

  // Temporizador
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = t => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Modo Sin Distracciones</Text>
      <Text style={[styles.task, { color: theme.text }]}>Meta: {taskName || 'Sin tarea'}</Text>
      <Text style={[styles.timer, { color: theme.points }]}>{formatTime(timeLeft)}</Text>
      <Text style={[styles.note, { color: theme.text }]} >Presiona atrás para salir con confirmación.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, marginBottom: 16 },
  task: { fontSize: 18, marginBottom: 24 },
  timer: { fontSize: 64, fontWeight: 'bold', marginBottom: 24 },
  note: { fontSize: 14 },
});
