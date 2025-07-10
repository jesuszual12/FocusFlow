import { useEffect, useRef, useState } from 'react';
import { AppState, Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';
import ProductivityTimer from '../../components/ProductivityTimer';

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
  const [showModal, setShowModal] = useState(false);
  const [points, setPoints] = useState(0);
  const [motivationalMsg, setMotivationalMsg] = useState(MOTIVATIONAL_MESSAGES[0]);
  const [theme, setTheme] = useState(THEMES[0]);
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
                { backgroundColor: t.button, borderWidth: theme.name === t.name ? 2 : 1, borderColor: theme.text }
              ]}
              onPress={() => setTheme(t)}
            >
              <Text style={{ color: t.buttonText, fontWeight: 'bold' }}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <ProductivityTimer onWorkCycleComplete={handleWorkCycleComplete} />
      </View>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.modal }]}>
            <Text style={[styles.modalText, { color: theme.modalText }]}>{motivationalMsg}</Text>
            <Button title="Seguir concentrado" color={theme.button} onPress={() => setShowModal(false)} />
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { padding: 24, borderRadius: 12, alignItems: 'center' },
  modalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
});