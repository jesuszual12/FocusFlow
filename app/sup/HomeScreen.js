import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';
import ProductivityTimer from '../../components/ProductivityTimer';
import { useTheme } from '../../components/ThemeContext';

export default function HomeScreen() {
  const { theme, setTheme, themes } = useTheme();
  const [points, setPoints] = useState(0);

  const handleWorkCycleComplete = () => {
    setPoints(prev => prev + 10);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>FocusFlow</Text>
        <Text style={[styles.points, { color: theme.points }]}>
          Puntos por completar ciclos: {points}
        </Text>

        <ProductivityTimer onWorkCycleComplete={handleWorkCycleComplete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
  points: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
});
