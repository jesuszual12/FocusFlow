import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';
import ProductivityTimer from '../../components/ProductivityTimer';

export default function HomeScreen() {
  const [points, setPoints] = useState(0);

  const handleWorkCycleComplete = () => {
    setPoints(prev => prev + 10);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={styles.title}>FocusFlow</Text>
        <Text style={styles.points}>Puntos por completar ciclos: {points}</Text>

        <ProductivityTimer onWorkCycleComplete={handleWorkCycleComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#1976d2' },
  points: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12, color: '#388e3c' },
});
