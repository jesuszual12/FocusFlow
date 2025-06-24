import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BlockerSettings from '../../components/BlockerSettings';
import NavbarBootstrap from '../../components/Navbar';

export default function BlockerScreen() {
  return (
    <View style={{ flex: 1 }}>
      <NavbarBootstrap />
      <View style={styles.container}>
        <Text style={styles.title}>Bloqueo de Apps</Text>
        <BlockerSettings />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1976d2', textAlign: 'center', marginBottom: 24 }
});