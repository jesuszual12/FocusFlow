import { createContext, useContext, useState } from 'react';

const THEMES = [
  {
    name: 'Claro',
    background: '#f8fafc',
    text: '#1976d2',
    points: '#388e3c',
    button: '#1976d2',
    buttonText: '#fff',
    modal: '#fff',
    modalText: '#1976d2'
  },
  {
    name: 'Oscuro',
    background: '#22223b',
    text: '#f2e9e4',
    points: '#c9ada7',
    button: '#4a4e69',
    buttonText: '#fff',
    modal: '#4a4e69',
    modalText: '#f2e9e4'
  },
  {
    name: 'Pastel',
    background: '#ffe4ec',
    text: '#c9184a',
    points: '#ffb4a2',
    button: '#ffb4a2',
    buttonText: '#fff',
    modal: '#fff',
    modalText: '#c9184a'
  }
];

const ThemeContext = createContext({
  theme: THEMES[0],
  setTheme: () => {},
  themes: THEMES
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES[0]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}