import { useState, useEffect } from 'react';
import { User } from '../types';
import { login as apiLogin, logout as apiLogout, getUserData } from '../services/authApi';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificar autenticación al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await getUserData();
        setIsAuthenticated(!!userData);
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: User): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar la función real de autenticación de la API
      await apiLogin({ 
        email: credentials.username, // Asumiendo que username puede ser un email
        password: credentials.password 
      });
      
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      // Manejar el error de autenticación
      const errorMessage = err instanceof Error ? err.message : 'Error de autenticación';
      console.error('Error en login:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiLogout();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    error,
    loading,
    login,
    logout
  };
}; 