import { useContext, useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { TaskContext } from './Taskcontext';

export default function TaskFormScreen({ navigation }) {
  const { addTask } = useContext(TaskContext);
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
    <View style={styles.container}>
      <TextInput
        placeholder="Nombre de la meta"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      <Button title="Guardar" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    fontSize: 16,
  },
});
