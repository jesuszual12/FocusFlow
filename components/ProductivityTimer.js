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

const MODES = [
  { name: 'Pomodoro', work: 1500, rest: 300, cycles: 4 },
  { name: 'Personalizado', work: 1800, rest: 600, cycles: 2 }
];

const SUGGESTED_LABELS = [
  "Estudiar para el examen", "Lectura", "Trabajo", "Ejercicio", "Descanso", "Tarea", "Meditación", "Proyecto personal"
];

const THEMES = [
  {
    name: 'Claro',
    background: '#f8fafc',
    text: '#1976d2',
    points: '#388e3c',
    button: '#1976d2',
    buttonText: '#fff',
    modal: '#fff',
    modalText: '#1976d2'
  },
  {
    name: 'Oscuro',
    background: '#22223b',
    text: '#f2e9e4',
    points: '#c9ada7',
    button: '#4a4e69',
    buttonText: '#fff',
    modal: '#4a4e69',
    modalText: '#f2e9e4'
  },
  {
    name: 'Pastel',
    background: '#ffe4ec',
    text: '#c9184a',
    points: '#ffb4a2',
    button: '#ffb4a2',
    buttonText: '#fff',
    modal: '#fff',
    modalText: '#c9184a'
  }
];

export default function ProductivityTimer({ onWorkCycleComplete }) {
  // Estados para timer
  const [theme, setTheme] = useState(THEMES[0]);

  const [mode, setMode] = useState(MODES[0]);
  const [workTime, setWorkTime] = useState(mode.work);
  const [restTime, setRestTime] = useState(mode.rest);
  const [cycles, setCycles] = useState(mode.cycles);
  const [timeLeft, setTimeLeft] = useState(mode.work);
  const [isWorking, setIsWorking] = useState(true);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [running, setRunning] = useState(false);
  const [label, setLabel] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [note, setNote] = useState('');
  const intervalRef = useRef(null);

  // Modal para nueva meta
  const [metaModalVisible, setMetaModalVisible] = useState(false);
  const [newMetaName, setNewMetaName] = useState('');
  const [newMetaDesc, setNewMetaDesc] = useState('');

  // Lógica de temporizador (igual que antes)
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

          // Guardar sesión en historial (solo label, note y tiempos)
          const session = {
            date: new Date().toISOString().split('T')[0],
            work: (workTime * cycles) / 60,
            rest: (restTime * cycles) / 60,
            label: label || customLabel || "Sin propósito",
            note: note || ""
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

  // Actualiza el temporizador cuando cambian tiempos personalizados
  useEffect(() => {
    if (mode.name === 'Personalizado') {
      setTimeLeft(isWorking ? workTime : restTime);
      setCurrentCycle(1);
      setRunning(false);
    }
  }, [workTime, restTime, cycles]);

  // Limpia inputs cruzados
  useEffect(() => { if (customLabel.length > 0) setLabel(''); }, [customLabel]);
  useEffect(() => { if (label.length > 0) setCustomLabel(''); }, [label]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Crear meta nueva (solo modal sin guardado en lista para simplificar)
  const handleCreateMeta = () => {
    if (!newMetaName.trim()) return Alert.alert("Error", "El nombre de la meta no puede estar vacío.");
    setLabel(newMetaName.trim());
    setNewMetaName('');
    setNewMetaDesc('');
    setMetaModalVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
      {/* Selector de tema arriba */}
      <View style={styles.themeRow}>
        <Text style={[styles.themeLabel, { color: theme.text }]}>Tema:</Text>
        {THEMES.map(t => (
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

      {/* Temporizador visible */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerLabel, { color: theme.points }]}>{isWorking ? 'Trabajando' : 'Descansando'}</Text>
        <Text style={[styles.timer, { color: theme.points }]}>{formatTime(timeLeft)}</Text>
        <Text style={[styles.cycleText, { color: theme.points }]}>Ciclo {currentCycle} / {cycles}</Text>
      </View>

      {/* Botones iniciar/pausar y reiniciar */}
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

      {/* Selección modo */}
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

      {/* Inputs para modo personalizado */}
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

      {/* Propósito */}
      <Text style={[styles.label, { marginTop: 20, color: theme.text }]}>Propósito</Text>
      <View style={styles.labelsContainer}>
        {SUGGESTED_LABELS.map(tag => (
          <TouchableOpacity
            key={tag}
            style={[
              styles.labelTag,
              label === tag && styles.labelTagActive,
              label === tag && { backgroundColor: theme.points, borderColor: theme.points }
            ]}
            onPress={() => setLabel(tag)}
          >
            <Text style={[
              styles.labelTagText,
              label === tag && styles.labelTagTextActive,
              label === tag && { color: '#fff' }
            ]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.inputMulti, { marginTop: 8, borderColor: theme.text, color: theme.text, backgroundColor: theme.modal }]}
        placeholder="Escribe tu propósito"
        placeholderTextColor={theme.text + '88'}
        value={customLabel}
        onChangeText={setCustomLabel}
        multiline
        textAlignVertical="top"
      />

      {/* Notas */}
      <Text style={[styles.label, { marginTop: 20, color: theme.text }]}>Notas</Text>
      <TextInput
        style={[styles.inputMulti, { borderColor: theme.text, color: theme.text, backgroundColor: theme.modal }]}
        placeholder="Notas"
        placeholderTextColor={theme.text + '88'}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={100}
        textAlignVertical="top"
      />

      {/* Botón + Nueva meta debajo de notas */}
      <TouchableOpacity
        style={[styles.createMetaBtn, { backgroundColor: theme.button }]}
        onPress={() => setMetaModalVisible(true)}
      >
        <Text style={[styles.createMetaBtnText, { color: theme.buttonText }]}>+ Nueva meta</Text>
      </TouchableOpacity>

      {/* Modal para crear nueva meta */}
      <Modal visible={metaModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalTitle, { color: theme.modalText }]}>Nueva Meta</Text>
            <TextInput
              placeholder="Nombre"
              placeholderTextColor={theme.modalText + 'aa'}
              value={newMetaName}
              onChangeText={setNewMetaName}
              style={[styles.modalInput, { borderBottomColor: theme.modalText, color: theme.modalText }]}
            />
            <TextInput
              placeholder="Descripción (opcional)"
              placeholderTextColor={theme.modalText + 'aa'}
              value={newMetaDesc}
              onChangeText={setNewMetaDesc}
              style={[styles.modalInput, { borderBottomColor: theme.modalText, color: theme.modalText }]}
            />
            <Button title="Guardar" onPress={handleCreateMeta} color={theme.button} />
            <Button title="Cancelar" color="#888" onPress={() => setMetaModalVisible(false)} />
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
  inputMulti: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 40,
    backgroundColor: '#f8fafc',
  },

  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  labelTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderWidth: 1,
    borderColor: '#198754',
  },
  labelTagActive: {
    backgroundColor: '#198754',
  },
  labelTagText: {
    color: '#198754',
    fontWeight: '600',
  },
  labelTagTextActive: {
    color: '#fff',
  },

  createMetaBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  createMetaBtnText: {
    fontWeight: 'bold',
    fontSize: 18,
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
