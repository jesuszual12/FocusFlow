import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);

  // Elimina una sesión individual
  const deleteSession = async (idx) => {
    const newSessions = sessions.filter((_, i) => i !== idx);
    setSessions(newSessions);
    await AsyncStorage.setItem('history', JSON.stringify(newSessions));
  };

  useEffect(() => {
    // Al montar el componente, lee el historial guardado en AsyncStorage
    (async () => {
      try {
        const data = await AsyncStorage.getItem('history');
        if (data) {
          setSessions(JSON.parse(data));
        }
      } catch (e) {
        setSessions([]);
      }
    })();
  }, []);

  // Calcula el total de minutos trabajados y de descanso
  const totalWork = sessions.reduce((acc, s) => acc + (s.work || s.minutesWorked || 0), 0);
  const totalRest = sessions.reduce((acc, s) => acc + (s.rest || s.minutesRested || 0), 0);

  return (
    <View style={{ flex: 1 }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={styles.title}>Historial y Estadísticas</Text>
        <FlatList
          data={sessions}
          keyExtractor={(item, idx) => item.date + (item.blocked ? JSON.stringify(item.blocked) : idx)}
          renderItem={({ item, index }) => (
            <View style={styles.session}>
              <Text>{item.date}</Text>
              {item.work !== undefined || item.minutesWorked !== undefined ? (
                <Text style={styles.badgeWork}>{(item.work || item.minutesWorked)} min trabajo</Text>
              ) : null}
              {item.rest !== undefined || item.minutesRested !== undefined ? (
                <Text style={styles.badgeRest}>{(item.rest || item.minutesRested)} min descanso</Text>
              ) : null}
              {item.blocked && item.blocked.length > 0 && (
                <Text style={{ color: '#dc3545', marginLeft: 8, fontSize: 12 }}>Apps: {item.blocked.join(', ')}</Text>
              )}
              <TouchableOpacity onPress={() => deleteSession(index)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <View style={styles.total}>
          <Text style={styles.badgeWork}>{totalWork} min trabajo</Text>
          <Text style={styles.badgeRest}>{totalRest} min descanso</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976d2', textAlign: 'center', marginBottom: 24 },
  session: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, backgroundColor: '#fff', padding: 8, borderRadius: 8 },
  badgeWork: { backgroundColor: '#198754', color: '#fff', padding: 4, borderRadius: 4, marginLeft: 8 },
  badgeRest: { backgroundColor: '#ffc107', color: '#333', padding: 4, borderRadius: 4, marginLeft: 8 },
  total: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  deleteBtn: {
    backgroundColor: '#ffc107',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteBtnText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
});