import { useContext, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NavbarBootstrap from '../../components/Navbar';
import ProductivityTimer from '../../components/ProductivityTimer';
import { TaskContext } from './Taskcontext';

const MOTIVATIONAL_MESSAGES = [
  "¡Sigue así, tu enfoque te acerca a tus metas!",
  "Cada minuto cuenta, ¡no te rindas!",
  "La constancia es la clave del éxito.",
  "¡Estás haciendo un gran trabajo!",
  "Recuerda por qué empezaste.",
  "¡Tu futuro yo te lo agradecerá!",
  "La disciplina tarde o temprano vence a la inteligencia.",
  "¡Un pequeño descanso y a seguir!"
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

export default function HomeScreen() {
  const { tasks, addTask } = useContext(TaskContext);

  const [showModal, setShowModal] = useState(false);
  const [points, setPoints] = useState(0);
  const [motivationalMsg, setMotivationalMsg] = useState(MOTIVATIONAL_MESSAGES[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [metaModalVisible, setMetaModalVisible] = useState(false);
  const [newMetaName, setNewMetaName] = useState('');
  const [newMetaDesc, setNewMetaDesc] = useState('');
  const [activeTask, setActiveTask] = useState(null);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const idx = Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length);
        setMotivationalMsg(MOTIVATIONAL_MESSAGES[idx]);
        setShowModal(true);
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const handleWorkCycleComplete = () => {
    setPoints(prev => prev + 10);
    // Aquí más adelante se puede registrar en historial por tarea
  };

  const handleCreateMeta = () => {
    if (!newMetaName.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      name: newMetaName,
      description: newMetaDesc
    };
    addTask(newTask);
    setNewMetaName('');
    setNewMetaDesc('');
    setMetaModalVisible(false);
    setActiveTask(newTask);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>FocusFlow</Text>
        <Text style={[styles.points, { color: theme.points }]}>Puntos por completar ciclos: {points}</Text>

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

        <Text style={[styles.subtitle, { color: theme.text }]}>Selecciona una meta:</Text>
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.taskCard, { backgroundColor: theme.modal }]}
              onPress={() => setActiveTask(item)}
            >
              <Text style={[styles.taskTitle, { color: theme.text }]}>{item.name}</Text>
              {item.description ? (
                <Text style={[styles.taskDesc, { color: theme.text }]}>{item.description}</Text>
              ) : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: theme.text }}>No hay metas creadas aún.</Text>
          }
        />

        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: theme.button }]}
          onPress={() => setMetaModalVisible(true)}
        >
          <Text style={{ color: theme.buttonText, fontWeight: 'bold' }}>+ Nueva meta</Text>
        </TouchableOpacity>

        {activeTask && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.activeTaskText, { color: theme.text }]}>
              Meta activa: <Text style={{ fontWeight: 'bold' }}>{activeTask.name}</Text>
            </Text>
          </View>
        )}

        <ProductivityTimer
          onWorkCycleComplete={handleWorkCycleComplete}
          task={activeTask}
        />
      </View>

      {/* MODAL de mensaje motivacional */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalText, { color: theme.modalText }]}>{motivationalMsg}</Text>
            <Button title="Seguir concentrado" color={theme.button} onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>

      {/* MODAL de nueva meta */}
      <Modal visible={metaModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalText, { color: theme.modalText }]}>Nueva Meta</Text>
            <TextInput
              placeholder="Nombre"
              value={newMetaName}
              onChangeText={setNewMetaName}
              style={styles.input}
            />
            <TextInput
              placeholder="Descripción"
              value={newMetaDesc}
              onChangeText={setNewMetaDesc}
              style={styles.input}
            />
            <Button title="Guardar" onPress={handleCreateMeta} color={theme.button} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  points: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  themeLabel: { fontSize: 16, marginRight: 8 },
  themeBtn: { padding: 8, borderRadius: 8, marginHorizontal: 4 },

  subtitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, marginTop: 20, textAlign: 'center' },
  taskCard: { padding: 12, borderRadius: 10, marginBottom: 10, elevation: 2 },
  taskTitle: { fontSize: 16, fontWeight: 'bold' },
  taskDesc: { fontSize: 14 },
  createBtn: { padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  activeTaskText: { textAlign: 'center', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 24, borderRadius: 12, alignItems: 'center', width: '80%' },
  modalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderBottomWidth: 1, marginBottom: 12, width: '100%', fontSize: 16 },
});
