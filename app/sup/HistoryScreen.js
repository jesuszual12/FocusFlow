import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';

const sessions = [
  { date: '2025-06-22', work: 90, rest: 20 },
  { date: '2025-06-21', work: 60, rest: 15 },
  { date: '2025-06-20', work: 120, rest: 30 }
];

export default function HistoryScreen() {
  const totalWork = sessions.reduce((acc, s) => acc + s.work, 0);
  const totalRest = sessions.reduce((acc, s) => acc + s.rest, 0);

  return (
    <View style={{ flex: 1 }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={styles.title}>Historial y Estadísticas</Text>
        <FlatList
          data={sessions}
          keyExtractor={item => item.date}
          renderItem={({ item }) => (
            <View style={styles.session}>
              <Text>{item.date}</Text>
              <Text style={styles.badgeWork}>{item.work} min trabajo</Text>
              <Text style={styles.badgeRest}>{item.rest} min descanso</Text>
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
  total: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 }
});