import React, { useState, createContext } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuth } from './src/hooks/useAuth';
import { User } from './src/types';

// Creamos un contexto para la autenticación
export const AuthContext = createContext<{
  isAuthenticated: boolean;
  error: string | null;
  loading: boolean;
  login: (user: User) => Promise<boolean>;
  logout: () => void;
}>({
  isAuthenticated: false,
  error: null,
  loading: false,
  login: async () => false,
  logout: () => {},
});

export default function App() {
  const auth = useAuth();

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={auth}>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
