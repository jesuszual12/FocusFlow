import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import NavbarBootstrap from '../../components/Navbar';
import { useTheme } from '../../components/ThemeContext'; // 1. Importa el hook

export default function HistoryScreen() {
  const { theme } = useTheme(); // 2. Usa el tema
  const [sessions, setSessions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [editingNoteIndex, setEditingNoteIndex] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await AsyncStorage.getItem('history');
      if (data) {
        const parsed = JSON.parse(data);
        setSessions(parsed);
        const groupedByTask = parsed.reduce((acc, session) => {
          const taskId = session.taskId || 'sin_tarea';
          const taskName = session.taskName || session.label || 'Sin tarea asignada';
          if (!acc[taskId]) {
            acc[taskId] = { taskName, sessions: [] };
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
  };

  const deleteAllSessions = async () => {
    setSessions([]);
    setGrouped({});
    await AsyncStorage.removeItem('history');
  };

  const deleteSession = async (timestampToDelete) => {
    Alert.alert('Confirmar', '¿Seguro que quieres borrar esta sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sí',
        style: 'destructive',
        onPress: async () => {
          const updatedSessions = sessions.filter(s => s.timestamp !== timestampToDelete);
          await AsyncStorage.setItem('history', JSON.stringify(updatedSessions));
          fetchSessions();
        }
      }
    ]);
  };

  const saveNote = async (idx) => {
    const newSessions = [...sessions];
    newSessions[idx].note = noteDraft;
    setSessions(newSessions);
    await AsyncStorage.setItem('history', JSON.stringify(newSessions));
    setEditingNoteIndex(null);
    setNoteDraft('');
    fetchSessions();
  };

  const formatShortTime = (seconds) => {
    const t = Math.round(seconds);
    if (t < 60) return `${t} segundo${t === 1 ? '' : 's'}`;
    const min = Math.floor(t / 60);
    return `${min} minuto${min === 1 ? '' : 's'}`;
  };

  const timeLabel = (label) => {
    if (!label) return "de trabajo";
    label = label.toLowerCase();
    if (label.includes("estudio") || label.includes("examen")) return "de estudio";
    if (label.includes("lectura")) return "de lectura";
    if (label.includes("descanso")) return "de descanso";
    if (label.includes("tarea")) return "de tarea";
    if (label.includes("ejercicio")) return "de ejercicio";
    if (label.includes("meditación")) return "de meditación";
    return `de ${label}`;
  };

  const totalWork = Math.round(sessions.reduce((acc, s) => acc + (s.work || s.minutesWorked || 0), 0));
  const totalRest = Math.round(sessions.reduce((acc, s) => acc + (s.rest || s.minutesRested || 0), 0));

  const labelTotals = {};
  sessions.forEach(s => {
    const label = s.label || 'Sin etiqueta';
    if (!labelTotals[label]) labelTotals[label] = 0;
    labelTotals[label] += Math.round(s.work || 0);
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <NavbarBootstrap />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>📘 Historial por Tarea</Text>

        <Text style={[styles.subtitle, { color: theme.text }]}>Propósito</Text>
        <View style={styles.labelList}>
          {Object.entries(labelTotals).map(([label, total]) => (
            <View key={label} style={[styles.labelItem, { borderColor: theme.points, backgroundColor: theme.background }]}>
              <Text style={[styles.labelText, { color: theme.points }]}>{label}</Text>
              <Text style={[styles.labelTime, { color: theme.points }]}>{Math.round(total)} min</Text>
            </View>
          ))}
        </View>

        {Object.entries(grouped).map(([taskId, group]) => {
          const totalWorkForLabel = Math.round(group.sessions.reduce((acc, item) => acc + (item.work || 0), 0));
          return (
            <View key={taskId} style={styles.group}>
              <Text style={[styles.taskName, { color: theme.text }]}>
                {group.taskName}{' '}
                <Text style={[styles.taskTotal, { color: theme.points }]}>({totalWorkForLabel} min trabajados)</Text>
              </Text>
              {group.sessions.map((item, idx) => {
                const globalIndex = sessions.findIndex(s => s.timestamp === item.timestamp);
                return (
                  <View key={item.timestamp || idx} style={[styles.sessionCard, { backgroundColor: theme.modal }]}>
                    <View style={styles.badgesRow}>
                      {item.work > 0 && (
                        <Text style={[styles.badgeWork, { backgroundColor: theme.points, color: theme.buttonText }]}>
                          {formatShortTime(item.work * 60)} {timeLabel(item.label)}
                        </Text>
                      )}
                      {item.rest > 0 && (
                        <Text style={styles.badgeRest}>
                          {formatShortTime(item.rest * 60)} de descanso
                        </Text>
                      )}
                    </View>

                    {editingNoteIndex === globalIndex ? (
                      <View style={[styles.noteBoxEdit, { backgroundColor: theme.background }]}>
                        <Text style={[styles.noteTitle, { color: theme.text }]}>Nota:</Text>
                        <TextInput
                          style={[styles.noteInput, { color: theme.text, backgroundColor: theme.modal }]}
                          placeholder="Escribe aquí tu nota..."
                          placeholderTextColor={theme.text + '99'}
                          value={noteDraft}
                          onChangeText={setNoteDraft}
                          maxLength={100}
                          multiline
                        />
                        <View style={styles.noteButtons}>
                          <TouchableOpacity onPress={() => saveNote(globalIndex)} style={[styles.saveNoteBtn, { backgroundColor: theme.points }]}>
                            <Text style={[styles.saveNoteBtnText, { color: theme.buttonText }]}>Guardar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => { setEditingNoteIndex(null); setNoteDraft(''); }}>
                            <Text style={[styles.cancelNoteText, { color: theme.text }]}>Cancelar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View>
                        {item.note?.trim() ? (
                          <View style={[styles.noteBox, { backgroundColor: theme.background }]}>
                            <Text style={[styles.noteTitle, { color: theme.text }]}>Nota:</Text>
                            <Text style={[styles.noteText, { color: theme.text }]}>{item.note}</Text>
                            <TouchableOpacity
                              onPress={() => { setEditingNoteIndex(globalIndex); setNoteDraft(item.note); }}
                              style={[styles.editBtn, { backgroundColor: theme.button }]}>
                              <Text style={[styles.editBtnText, { color: theme.buttonText }]}>Editar nota</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => { setEditingNoteIndex(globalIndex); setNoteDraft(''); }}
                            style={[styles.addNoteBtn, { backgroundColor: theme.button }]}>
                            <Text style={[styles.addNoteBtnText, { color: theme.buttonText }]}>+ Agregar nota</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    <TouchableOpacity onPress={() => deleteSession(item.timestamp)} style={[styles.deleteBtn, { backgroundColor: theme.modal }]}>
                      <Text style={[styles.deleteBtnText, { color: '#d32f2f' }]}>✖</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={styles.total}>
          <Text style={[styles.badgeWork, { backgroundColor: theme.points, color: theme.buttonText }]}>{totalWork} min trabajo</Text>
          <Text style={styles.badgeRest}>{totalRest} min descanso</Text>
        </View>

        <TouchableOpacity onPress={deleteAllSessions} style={[styles.deleteAllBtn, { backgroundColor: '#dc3545' }]}>
          <Text style={styles.deleteAllBtnText}>Eliminar todo el historial</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976d2', textAlign: 'center', marginBottom: 24 },
  subtitle: { color: '#1976d2', fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  labelList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  labelItem: {
    borderWidth: 1,
    borderColor: '#198754',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginRight: 8,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: { color: '#198754', fontWeight: 'bold', fontSize: 15 },
  labelTime: { color: '#198754', marginLeft: 8, fontSize: 15 },
  group: { marginBottom: 24 },
  taskName: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#4a4e69' },
  taskTotal: { fontSize: 14, color: "#198754" },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'relative'
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap'
  },
  badgeWork: {
    backgroundColor: '#198754',
    color: '#fff',
    padding: 6,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  badgeRest: {
    backgroundColor: '#ffc107',
    color: '#333',
    padding: 6,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  noteBox: {
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  noteBoxEdit: {
    backgroundColor: '#f5f8fa',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  noteTitle: { color: '#888', fontSize: 13, fontWeight: 'bold', marginBottom: 2 },
  noteText: { color: '#444', fontSize: 15, fontStyle: 'italic', marginBottom: 6 },
  noteInput: {
    borderWidth: 1,
    borderColor: '#b0b7c3',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 6,
    fontSize: 15,
    minHeight: 30,
    color: '#333',
  },
  noteButtons: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveNoteBtn: {
    backgroundColor: '#198754',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  saveNoteBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelNoteText: { color: '#888', fontWeight: 'bold' },
  addNoteBtn: {
    backgroundColor: '#e7eaf6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  addNoteBtnText: { color: '#1976d2', fontWeight: 'bold' },
  editBtn: {
    backgroundColor: '#e7eaf6',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  editBtnText: { color: '#1976d2', fontWeight: 'bold', fontSize: 13 },
  deleteBtn: {
    backgroundColor: '#e9ecef',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-end',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  deleteBtnText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 18,
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
