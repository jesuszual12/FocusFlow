import { createContext, useContext, useState } from 'react';

const light = {
  background: '#f3f6fa',
  card: '#fff',
  accent: '#1976d2',
  accent2: '#198754',
  accent3: '#17a2b8',
  text: '#222',
  subtext: '#888',
  input: '#f8fafc',
  border: '#ccc',
  danger: '#d32f2f',
  warning: '#ffc107',
  secondary: '#6c757d'
};
const dark = {
  background: '#11151a',
  card: '#181d23',
  accent: '#90caf9',
  accent2: '#57e690',
  accent3: '#40c9e6',
  text: '#e3e9f3',
  subtext: '#aab6c9',
  input: '#23272e',
  border: '#333a47',
  danger: '#ff6b81',
  warning: '#ffe066',
  secondary: '#343a40'
};

const ThemeContext = createContext({ theme: light, toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(light);
  const toggleTheme = () => setTheme(t => (t === light ? dark : light));
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}