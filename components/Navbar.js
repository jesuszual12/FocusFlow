import { useRouter, useSegments } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const tabs = [
  { name: 'Inicio', route: '/' },
  { name: 'Historial', route: '/history' },
];

export default function NavbarBootstrap() {
  const router = useRouter();
  const segments = useSegments();
  const current = '/' + (segments[0] || ''); // corregido

  const handlePress = (route) => {
    if (route !== current) {
      router.replace(route); // solo navega si no estamos ahí
    }
  };

  return (
    <View style={styles.navbar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.route}
          style={[
            styles.link,
            current === tab.route && styles.active
          ]}
          onPress={() => handlePress(tab.route)}
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
    marginTop: 40, // 👈 ajusta este valor según lo que necesites
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
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
