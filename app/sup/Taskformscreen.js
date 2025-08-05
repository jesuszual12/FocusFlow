import { useContext, useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../../components/ThemeContext'; // 1. Importa el hook
import { TaskContext } from './Taskcontext';

export default function TaskFormScreen({ navigation }) {
  const { addTask } = useContext(TaskContext);
  const { theme } = useTheme(); // 2. Usa el tema
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    const newTask = {
      id: uuidv4(),
      name,
      description,
    };
    addTask(newTask);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TextInput
        placeholder="Nombre de la meta"
        placeholderTextColor={theme.text + '99'}
        value={name}
        onChangeText={setName}
        style={[styles.input, { color: theme.text, borderBottomColor: theme.points }]}
      />
      <TextInput
        placeholder="Descripción (opcional)"
        placeholderTextColor={theme.text + '99'}
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { color: theme.text, borderBottomColor: theme.points }]}
      />
      <View style={{ marginTop: 10 }}>
        <Button
          title="Guardar"
          color={theme.button}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    fontSize: 16,
    paddingVertical: 6,
  },
});
