import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Alert,
  Button,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { useTheme } from './ThemeContext';

const MODES = [
  { name: 'Pomodoro', work: 1500, rest: 300, cycles: 4 },
  { name: 'Personalizado', work: 1800, rest: 600, cycles: 2 }
];

const DEFAULT_LABELS = [
  "Estudiar para el examen", "Lectura", "Trabajo", "Ejercicio",
  "Descanso", "Tarea", "Meditación", "Proyecto personal"
];

export default function ProductivityTimer({ onWorkCycleComplete }) {
  const { theme, setTheme, themes } = useTheme();
  const [mode, setMode] = useState(MODES[0]);
  const [workTime, setWorkTime] = useState(mode.work);
  const [restTime, setRestTime] = useState(mode.rest);
  const [cycles, setCycles] = useState(mode.cycles);
  const [timeLeft, setTimeLeft] = useState(mode.work);
  const [isWorking, setIsWorking] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState('');

  const [customLabels, setCustomLabels] = useState([]);
  const [hiddenDefaultLabels, setHiddenDefaultLabels] = useState([]); // NUEVO
  const [labelModalVisible, setLabelModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const intervalRef = useRef(null);

  useEffect(() => {
    const loadCustomLabels = async () => {
      try {
        const stored = await AsyncStorage.getItem('customLabels');
        if (stored) setCustomLabels(JSON.parse(stored));
        // Cargar etiquetas default ocultas
        const hidden = await AsyncStorage.getItem('hiddenDefaultLabels');
        if (hidden) setHiddenDefaultLabels(JSON.parse(hidden));
      } catch (e) {
        console.error('Error cargando etiquetas:', e);
      }
    };
    loadCustomLabels();
  }, []);

  // NUEVO: función para eliminar etiqueta
  const handleDeleteLabel = async (tag) => {
    if (customLabels.includes(tag)) {
      // Eliminar de customLabels
      const updated = customLabels.filter(l => l !== tag);
      setCustomLabels(updated);
      await AsyncStorage.setItem('customLabels', JSON.stringify(updated));
      if (label === tag) setLabel('');
    } else if (DEFAULT_LABELS.includes(tag)) {
      // Ocultar default label
      const updated = [...hiddenDefaultLabels, tag];
      setHiddenDefaultLabels(updated);
      await AsyncStorage.setItem('hiddenDefaultLabels', JSON.stringify(updated));
      if (label === tag) setLabel('');
    }
  };

  const labels = [
    ...DEFAULT_LABELS.filter(l => !customLabels.includes(l) && !hiddenDefaultLabels.includes(l)),
    ...customLabels
  ];

  useEffect(() => {
    if (!running) return;
    if (timeLeft === 0) {
      if (isWorking) {
        onWorkCycleComplete?.();
        setIsWorking(false);
        setTimeLeft(restTime);
        Vibration.vibrate(Platform.OS === 'ios' ? 400 : [0, 250, 100, 250]);
        AccessibilityInfo.announceForAccessibility("Tiempo de descanso");
      } else {
        if (currentCycle < cycles) {
          setIsWorking(true);
          setCurrentCycle(currentCycle + 1);
          setTimeLeft(workTime);
          Vibration.vibrate(Platform.OS === 'ios' ? 400 : [0, 250, 100, 250]);
          AccessibilityInfo.announceForAccessibility("Trabajando");
        } else {
          setRunning(false);
          Vibration.vibrate([0, 600, 200, 600]);
          Alert.alert("\u00a1Sesiones completadas!", "\u00a1Buen trabajo!");

          const session = {
            date: new Date().toISOString().split('T')[0],
            work: (workTime * cycles) / 60,
            rest: (restTime * cycles) / 60,
            label: label || "Sin propósito"
          };
          (async () => {
            try {
              const data = await AsyncStorage.getItem('history');
              const history = data ? JSON.parse(data) : [];
              history.push(session);
              await AsyncStorage.setItem('history', JSON.stringify(history));
            } catch (e) {
              console.error("Error guardando historial", e);
            }
          })();
        }
      }
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [timeLeft, running, isWorking]);

  useEffect(() => {
    if (mode.name === 'Personalizado') {
      setTimeLeft(isWorking ? workTime : restTime);
      setCurrentCycle(1);
      setRunning(false);
    }
  }, [workTime, restTime, cycles]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleAddLabel = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      Alert.alert("Error", "La etiqueta no puede estar vacía.");
      return;
    }
    if (customLabels.includes(trimmed) || DEFAULT_LABELS.includes(trimmed)) {
      Alert.alert("Error", "Esta etiqueta ya existe.");
      return;
    }
    try {
      const updatedLabels = [...customLabels, trimmed];
      setCustomLabels(updatedLabels);
      await AsyncStorage.setItem('customLabels', JSON.stringify(updatedLabels));
      setNewLabel('');
      setLabelModalVisible(false);
    } catch (e) {
      console.error('Error guardando etiqueta personalizada:', e);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.themeRow}>
        <Text style={[styles.themeLabel, { color: theme.text }]}>Tema:</Text>
        {themes.map(t => (
          <TouchableOpacity
            key={t.name}
            style={[
              styles.themeBtn,
              {
                backgroundColor: t.button,
                borderWidth: theme.name === t.name ? 2 : 1,
                borderColor: theme.text
              }
            ]}
            onPress={() => setTheme(t)}
          >
            <Text style={{ color: t.buttonText, fontWeight: 'bold' }}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.timerContainer}>
        <Text style={[styles.timerLabel, { color: theme.points }]}>{isWorking ? 'Trabajando' : 'Descansando'}</Text>
        <Text style={[styles.timer, { color: theme.points }]}>{formatTime(timeLeft)}</Text>
        <Text style={[styles.cycleText, { color: theme.points }]}>Ciclo {currentCycle} / {cycles}</Text>
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.btn, running ? styles.btnPause : styles.btnStart]}
          onPress={() => setRunning(!running)}
        >
          <Text style={styles.btnText}>{running ? 'Pausar' : 'Iniciar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnReset]}
          onPress={() => setTimeLeft(isWorking ? workTime : restTime)}
        >
          <Text style={styles.btnText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.modeRow}>
        {MODES.map(m => (
          <TouchableOpacity
            key={m.name}
            style={[styles.modeBtn, mode.name === m.name && styles.modeBtnActive]}
            onPress={() => setMode(m)}
          >
            <Text style={[styles.modeBtnText, mode.name === m.name && styles.modeBtnTextActive]}>{m.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode.name === 'Personalizado' && (
        <View style={styles.customInputsRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Trabajo (seg)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.text, color: theme.text, backgroundColor: theme.modal }]}
              keyboardType="numeric"
              value={workTime.toString()}
              onChangeText={v => setWorkTime(Number(v))}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Descanso (seg)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.text, color: theme.text, backgroundColor: theme.modal }]}
              keyboardType="numeric"
              value={restTime.toString()}
              onChangeText={v => setRestTime(Number(v))}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Ciclos</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.text, color: theme.text, backgroundColor: theme.modal }]}
              keyboardType="numeric"
              value={cycles.toString()}
              onChangeText={v => setCycles(Number(v))}
            />
          </View>
        </View>
      )}

      <Text style={[styles.label, { marginTop: 20, color: theme.text }]}>Propósito</Text>
      <View style={styles.labelsContainer}>
        {labels.map(tag => (
          <View key={tag} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[
                styles.labelBubble,
                label === tag && { backgroundColor: theme.points, borderColor: theme.points }
              ]}
              onPress={() => setLabel(tag)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.labelText,
                label === tag && { color: '#fff', fontWeight: 'bold' }
              ]}>{tag}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteLabel(tag)}>
              <View style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>✕</Text>
              </View>
            </TouchableOpacity>
          </View>
        ))}
        {/* Botón para agregar nueva etiqueta */}
        <TouchableOpacity
          style={[styles.labelBubble, styles.addBubble, { borderColor: theme.points }]}
          onPress={() => setLabelModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.labelText, { color: theme.points, fontWeight: 'bold' }]}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={labelModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.modalText }]}>Nueva Etiqueta</Text>
            <TextInput
              placeholder="Nombre de la etiqueta"
              placeholderTextColor={theme.modalText + 'aa'}
              value={newLabel}
              onChangeText={setNewLabel}
              style={[styles.modalInput, { borderBottomColor: theme.modalText, color: theme.modalText }]}
            />
            <Button title="Guardar" onPress={handleAddLabel} color={theme.button} />
            <Button title="Cancelar" color="#888" onPress={() => setLabelModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  themeLabel: {
    fontSize: 16,
    marginRight: 8,
    alignSelf: 'center',
  },
  themeBtn: {
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 6,
  },

  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  timer: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  cycleText: {
    fontSize: 14,
    marginTop: 4,
  },

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
    marginHorizontal: 10,
  },
  btnStart: { backgroundColor: '#198754' },
  btnPause: { backgroundColor: '#ffc107' },
  btnReset: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  modeBtnActive: {
    backgroundColor: '#198754',
  },
  modeBtnText: {
    fontWeight: 'bold',
    color: '#198754',
  },
  modeBtnTextActive: {
    color: '#fff',
  },

  customInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  },

  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  labelBubble: {
    backgroundColor: '#e0f2f1',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
    borderWidth: 1,
    borderColor: '#4db6ac',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  labelText: {
    color: '#00796b',
    fontWeight: '600',
    fontSize: 14,
  },
  addBubble: {
    backgroundColor: '#fff',
    borderStyle: 'dashed',
  },
  deleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#e57373',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  deleteBtnText: {
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    borderBottomWidth: 1,
    marginBottom: 16,
    fontSize: 16,
    paddingVertical: 6,
  },
});
