import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function IoTIndicator({ status }) {
  const color = status === 'work' ? '#198754' : status === 'rest' ? '#ffc107' : '#dc3545';
  const label = status === 'work' ? 'Trabajando' : status === 'rest' ? 'Descansando' : 'Fin de sesión';
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { backgroundColor: color }]} />
      <Text style={styles.label}>{label} (Pulsera IoT)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  circle: { width: 36, height: 36, borderRadius: 18, marginRight: 12, borderWidth: 2, borderColor: '#333' },
  label: { fontSize: 18 }
});