import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem('TASKS');
      if (stored) setTasks(JSON.parse(stored));
    } catch (err) {
      console.error('Error loading tasks:', err);
    }
  };

  const saveTasks = async (newTasks) => {
    try {
      await AsyncStorage.setItem('TASKS', JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (err) {
      console.error('Error saving tasks:', err);
    }
  };

  const addTask = (task) => {
    const newTasks = [...tasks, task];
    saveTasks(newTasks);
  };

  const removeTask = (id) => {
    const newTasks = tasks.filter(t => t.id !== id);
    saveTasks(newTasks);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, removeTask }}>
      {children}
    </TaskContext.Provider>
  );
};
