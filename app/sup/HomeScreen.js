import { useEffect, useRef, useState } from 'react';
import { AppState, Button, Modal, StyleSheet, Text, View } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';
import ProductivityTimer from '../../components/ProductivityTimer';

export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const [points, setPoints] = useState(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        setShowModal(true);
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const handleWorkCycleComplete = () => {
    setPoints(prev => prev + 10); // 10 puntos por ciclo completado
  };

  return (
    <View style={{ flex: 1 }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={styles.title}>FocusFlow</Text>
        <Text style={styles.points}>Puntos por completar ciclos: {points}</Text>
        <ProductivityTimer onWorkCycleComplete={handleWorkCycleComplete} />
      </View>
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¡Recuerda mantenerte concentrado!</Text>
            <Button title="Seguir concentrado" onPress={() => setShowModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1976d2', textAlign: 'center', marginBottom: 24 },
  points: { fontSize: 18, color: '#388e3c', fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center' },
  modalText: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#1976d2' },
});