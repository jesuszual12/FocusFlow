import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NavbarBootstrap from '../../components/Navbar';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);
  const [grouped, setGrouped] = useState({});

  const deleteAllSessions = async () => {
    setSessions([]);
    setGrouped({});
    await AsyncStorage.removeItem('history');
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await AsyncStorage.getItem('history');
        if (data) {
          const parsed = JSON.parse(data);
          setSessions(parsed);
          const groupedByTask = parsed.reduce((acc, session) => {
            const taskId = session.taskId || 'sin_tarea';
            const taskName = session.taskName || 'Sin tarea asignada';
            if (!acc[taskId]) {
              acc[taskId] = {
                taskName,
                sessions: [],
              };
            }
            acc[taskId].sessions.push(session);
            return acc;
          }, {});
          setGrouped(groupedByTask);
        }
      } catch (e) {
        setSessions([]);
        setGrouped({});
      }
    })();
  }, []);

  const totalWork = sessions.reduce((acc, s) => acc + (s.work || s.minutesWorked || 0), 0);
  const totalRest = sessions.reduce((acc, s) => acc + (s.rest || s.minutesRested || 0), 0);

  return (
    <View style={{ flex: 1 }}>
      <NavbarBootstrap />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Historial por Tarea</Text>

        {Object.entries(grouped).map(([taskId, group]) => (
          <View key={taskId} style={styles.group}>
            <Text style={styles.taskName}>{group.taskName}</Text>
            {group.sessions.map((item, idx) => (
              <View key={idx} style={styles.session}>
                <Text>{item.date}</Text>
                {item.work ? (
                  <Text style={styles.badgeWork}>{item.work} min trabajo</Text>
                ) : null}
                {item.rest ? (
                  <Text style={styles.badgeRest}>{item.rest} min descanso</Text>
                ) : null}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.total}>
          <Text style={styles.badgeWork}>{totalWork} min trabajo</Text>
          <Text style={styles.badgeRest}>{totalRest} min descanso</Text>
        </View>

        <TouchableOpacity onPress={deleteAllSessions} style={styles.deleteAllBtn}>
          <Text style={styles.deleteAllBtnText}>Eliminar todo el historial</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976d2', textAlign: 'center', marginBottom: 24 },
  group: { marginBottom: 24 },
  taskName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#4a4e69' },
  session: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeWork: {
    backgroundColor: '#198754',
    color: '#fff',
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeRest: {
    backgroundColor: '#ffc107',
    color: '#333',
    padding: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  deleteAllBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginTop: 24,
    alignSelf: 'center',
  },
  deleteAllBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
