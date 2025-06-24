import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import IoTIndicator from '../../components/IoTIndicator';
import NavbarBootstrap from '../../components/Navbar';

export default function IoTScreen() {
  const [status, setStatus] = useState('work');
  return (
    <View style={{ flex: 1 }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={styles.title}>Pulsera IoT</Text>
        <IoTIndicator status={status} />
        <View style={styles.row}>
          <Button title="Trabajando" color="#198754" onPress={() => setStatus('work')} />
          <Button title="Descansando" color="#ffc107" onPress={() => setStatus('rest')} />
          <Button title="Fin" color="#dc3545" onPress={() => setStatus('end')} />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976d2', textAlign: 'center', marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 24 }
});