import { StyleSheet, Text, View } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';
import ProductivityTimer from '../../components/ProductivityTimer';
import AppStateWatcher from '../AppStateWatcher'; // Importa el watcher

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      <AppStateWatcher /> {/* Agrega el watcher aquí */}
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={styles.title}>FocusFlow</Text>
        <ProductivityTimer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1976d2', textAlign: 'center', marginBottom: 24 },
});