import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const APPS = ['Facebook', 'WhatsApp', 'Instagram', 'YouTube', 'Twitter', 'Correo'];

export default function BlockerSettings() {
  const [blocked, setBlocked] = useState([]);

  const toggleApp = app => {
    setBlocked(blocked.includes(app) ? blocked.filter(a => a !== app) : [...blocked, app]);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Bloqueo de Apps</Text>
      <View style={styles.listGroup}>
        {APPS.map(app => (
          <TouchableOpacity
            key={app}
            style={[
              styles.listGroupItem,
              blocked.includes(app) ? styles.bgDanger : styles.bgLight,
              blocked.includes(app) ? styles.textWhite : styles.textDark
            ]}
            onPress={() => toggleApp(app)}
          >
            <Text style={[styles.fs5, { fontWeight: blocked.includes(app) ? 'bold' : 'normal' }]}>
              {app}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.mt3}>
        <Text style={{ fontWeight: 'bold' }}>Apps bloqueadas:</Text> {blocked.length ? blocked.join(', ') : 'Ninguna'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0d6efd', textAlign: 'center', marginBottom: 8 },
  listGroup: { marginBottom: 8 },
  listGroupItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bgDanger: { backgroundColor: '#dc3545' },
  bgLight: { backgroundColor: '#f8f9fa' },
  textWhite: { color: '#fff' },
  textDark: { color: '#212529' },
  fs5: { fontSize: 16 },
  mt3: { marginTop: 12, textAlign: 'center' },
});