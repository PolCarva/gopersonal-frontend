import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '../components/InputField';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { RootStackParamList } from '../types';
import { login as apiLogin } from '../services/authApi';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!username.trim()) {
      setUsernameError('El nombre de usuario es requerido');
      isValid = false;
    } else {
      setUsernameError('');
    }

    if (!password.trim()) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      // Intentamos autenticar usando la API
      // Asumimos que el username puede ser también un email
      await apiLogin({ 
        email: username, // Usamos el campo username como email
        password 
      });
      
      // Si el login es exitoso, navegamos a Productos
      navigation.reset({
        index: 0,
        routes: [{ name: 'Products' }],
      });
    } catch (error) {
      console.error('Error en login:', error);
      // Mostrar un mensaje más claro sobre el error
      setLoginError(error instanceof Error 
        ? error.message 
        : 'Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://picsum.photos/id/20/200/200' }}
          style={styles.logo}
        />
        <Text style={styles.appName}>Mi Tienda</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Iniciar Sesión</Text>
        
        <InputField
          label="Email"
          value={username}
          onChangeText={setUsername}
          placeholder="Ingrese su email"
          error={usernameError}
        />
        
        <InputField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Ingrese su contraseña"
          secureTextEntry
          error={passwordError}
        />

        {(loginError) && <Text style={styles.errorText}>{loginError}</Text>}
        
        <ButtonPrimary
          title="Iniciar Sesión"
          onPress={handleLogin}
          isLoading={isLoading}
          disabled={isLoading}
        />
        
        <TouchableOpacity 
          style={styles.registerLink}
          onPress={handleRegister}
        >
          <Text style={styles.registerLinkText}>
            ¿No tienes una cuenta? Regístrate aquí
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.hint}>
          Tip: Para crear una cuenta, usa el enlace de registro
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#3498db',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerLinkText: {
    color: '#3498db',
    fontSize: 16,
  },
  hint: {
    marginTop: 20,
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
}); 