import { useState } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (credentials: User): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    // Simulando una llamada a API con un timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        // Credenciales mock para probar
        if (credentials.username === 'usuario' && credentials.password === '123456') {
          setIsAuthenticated(true);
          setLoading(false);
          resolve(true);
        } else {
          setError('Usuario o contraseña incorrectos');
          setLoading(false);
          resolve(false);
        }
      }, 1000);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    error,
    loading,
    login,
    logout
  };
}; 