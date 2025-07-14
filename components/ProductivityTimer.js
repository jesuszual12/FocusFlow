import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const MODES = [
  { name: "Pomodoro", work: 25, rest: 5, cycles: 4 },
  { name: "Personalizado", work: 30, rest: 10, cycles: 2 },
];

const router = useRouter();

const MESSAGES = [
  "¡Tú puedes con este reto!",
  "Recuerda tomar agua y respirar profundo.",
  "Cada ciclo te acerca a tu meta.",
  "¡Sigue así, lo estás haciendo genial!",
  "La constancia es la clave del éxito.",
  "Un descanso también es productividad.",
  "¡Hoy es un gran día para avanzar!",
];

export default function ProductivityTimer({ onWorkCycleComplete, task }) {
  const [mode, setMode] = useState(MODES[0]);
  const [workTime, setWorkTime] = useState(mode.work);
  const [restTime, setRestTime] = useState(mode.rest);
  const [cycles, setCycles] = useState(mode.cycles);
  const [isWorking, setIsWorking] = useState(true);
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [running, setRunning] = useState(false);
  const [motivationalMsg, setMotivationalMsg] = useState("");

  useEffect(() => {
    setWorkTime(mode.work);
    setRestTime(mode.rest);
    setCycles(mode.cycles);
    setTimeLeft(mode.work * 60);
    setIsWorking(true);
    setCurrentCycle(1);
    setRunning(false);
  }, [mode]);

  // Función para guardar la sesión en AsyncStorage
  const saveSession = async () => {
    const session = {
      date: new Date().toLocaleString(),
      work: workTime * cycles,
      rest: restTime * cycles,
      taskName: task ? task.name : "Sin tarea",
      taskId: task ? task.id : null,
    };
    try {
      const data = await AsyncStorage.getItem("history");
      const history = data ? JSON.parse(data) : [];
      history.unshift(session);
      await AsyncStorage.setItem("history", JSON.stringify(history));
    } catch (e) {
      console.error("Error guardando sesión:", e);
    }
  };

  useEffect(() => {
    if (!running) return;
    if (timeLeft === 0) {
      if (isWorking) {
        Alert.alert(
          "¡Tiempo de descanso!",
          "Has terminado tu ciclo de trabajo. Es hora de descansar."
        );
        setIsWorking(false);
        setTimeLeft(restTime * 60);
        if (onWorkCycleComplete) onWorkCycleComplete();
      } else {
        Alert.alert(
          "¡Descanso terminado!",
          "Has terminado tu descanso. Prepárate para el siguiente ciclo."
        );
        if (currentCycle < cycles) {
          setIsWorking(true);
          setCurrentCycle(currentCycle + 1);
          setTimeLeft(workTime * 60);
        } else {
          setRunning(false);
          saveSession(); // <-- Guarda la sesión al terminar todos los ciclos
        }
      }
    }

    const timer = setInterval(() => {
      if (timeLeft > 0 && running) setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, running, isWorking, currentCycle, cycles, workTime, restTime]);

  useEffect(() => {
    if (mode.name === "Personalizado") {
      setTimeLeft(isWorking ? workTime * 60 : restTime * 60);
      setCurrentCycle(1);
      setRunning(false);
    }
  }, [workTime, restTime, cycles]);

  useEffect(() => {
    // Selecciona un mensaje aleatorio al abrir la app
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMotivationalMsg(randomMsg);
  }, []);

  return (
    <View style={styles.card}>
      {/* Mensaje motivacional */}
      <Text style={styles.motivational}>{motivationalMsg}</Text>
      <Text style={styles.title}>Temporizador</Text>
      {task && (
        <Text style={styles.activeTask}>
          Meta activa: <Text style={{ fontWeight: "bold" }}>{task.name}</Text>
        </Text>
      )}

      {/* Selector de modo */}
      <View style={styles.pickerIOS}>
        {MODES.map((m) => (
          <TouchableOpacity
            key={m.name}
            style={[
              styles.pickerBtn,
              mode.name === m.name && styles.pickerBtnActive,
            ]}
            onPress={() => setMode(m)}
          >
            <Text
              style={[
                styles.pickerBtnText,
                mode.name === m.name && { color: "#fff" },
              ]}
            >
              {m.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Inputs personalizados */}
      {mode.name === "Personalizado" && (
        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trabajo (min)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={workTime.toString()}
              onChangeText={(v) => setWorkTime(Number(v))}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descanso (min)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={restTime.toString()}
              onChangeText={(v) => setRestTime(Number(v))}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ciclos</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cycles.toString()}
              onChangeText={(v) => setCycles(Number(v))}
            />
          </View>
        </View>
      )}
      {/* Estado y tiempo */}
      <View style={{ alignItems: "center", marginVertical: 16 }}>
        <Text style={styles.stateText}>
          {isWorking ? "Trabajando" : "Descansando"} - Ciclo {currentCycle}/
          {cycles}
        </Text>
        <Text
          style={[styles.timer, { color: isWorking ? "#198754" : "#ffc107" }]}
        >
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </Text>
      </View>
      {/* Botones */}
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, running ? styles.btnWarning : styles.btnSuccess]}
          onPress={() => setRunning(!running)}
        >
          <Text style={styles.btnText}>{running ? "Pausar" : "Iniciar"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnDark]}
          onPress={() => {
            if (!task) {
              Alert.alert(
                "Sin meta activa",
                "Selecciona una meta para usar el modo sin distracciones."
              );
              return;
            }
            router.push({
              pathname: "/FocusMode",
              params: { duration: workTime, taskName: task.name },
            });
          }}
        >
          <Text style={styles.btnText}>Modo sin distracciones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => setTimeLeft(isWorking ? workTime * 60 : restTime * 60)}
        >
          <Text style={styles.btnText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnDark: { backgroundColor: "#343a40" },

  activeTask: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 12,
    textAlign: "center",
  },
  pickerIOS: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  pickerBtn: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    backgroundColor: "#e9ecef",
  },
  pickerBtnActive: { backgroundColor: "#1976d2" },
  pickerBtnText: { color: "#222", fontWeight: "bold" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  inputGroup: { flex: 1, marginHorizontal: 4 },
  label: { fontSize: 12, color: "#333", marginBottom: 2 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 6,
    fontSize: 16,
    backgroundColor: "#f8fafc",
    textAlign: "center",
  },
  stateText: { fontSize: 16, marginBottom: 4, color: "#333" },
  timer: { fontSize: 48, fontWeight: "bold", letterSpacing: 2 },
  btnRow: { flexDirection: "row", justifyContent: "center", marginTop: 8 },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  btnSuccess: { backgroundColor: "#198754" },
  btnWarning: { backgroundColor: "#ffc107" },
  btnSecondary: { backgroundColor: "#6c757d" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  motivational: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
});
