import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '../components/InputField';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
    if (validateForm()) {
      const success = await login({ username, password });
      
      if (success) {
        navigation.navigate('Products');
      }
    }
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
          label="Usuario"
          value={username}
          onChangeText={setUsername}
          placeholder="Ingrese su usuario"
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

        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <ButtonPrimary
          title="Iniciar Sesión"
          onPress={handleLogin}
          isLoading={loading}
        />
        
        <Text style={styles.hint}>
          Pista: Usuario "usuario" y contraseña "123456"
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
  hint: {
    marginTop: 20,
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
}); 