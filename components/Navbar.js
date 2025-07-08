import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

const tabs = [
  { name: 'Inicio', route: '/' },
  { name: 'Bloqueo', route: '/blocker' },
  { name: 'Historial', route: '/history' },
];

export default function NavbarBootstrap() {
  const router = useRouter();
  const segments = useSegments();
  const current = '/' + (segments[1] || '');

  return (
    <View style={styles.navbar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.route}
          style={[
            styles.link,
            (current === tab.route || (tab.route === '/' && current === '/index')) && styles.active
          ]}
          onPress={() => router.push(tab.route)}
        >
          <Text style={styles.linkText}>{tab.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#0d6efd',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  link: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  linkText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  active: {
    backgroundColor: '#0b5ed7',
  },
});