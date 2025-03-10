import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '../components/InputField';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { register } from '../services/authApi';
import { RootStackParamList } from '../types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Estados para errores de validación
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;

    // Validar nombre de usuario
    if (!username.trim()) {
      setUsernameError('El nombre de usuario es requerido');
      isValid = false;
    } else if (username.length < 3) {
      setUsernameError('El nombre de usuario debe tener al menos 3 caracteres');
      isValid = false;
    } else {
      setUsernameError('');
    }

    // Validar email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email.trim()) {
      setEmailError('El correo electrónico es requerido');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar nombre
    if (!name.trim()) {
      setNameError('El nombre es requerido');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validar contraseña
    if (!password) {
      setPasswordError('La contraseña es requerida');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validar confirmación de contraseña
    if (!confirmPassword) {
      setConfirmPasswordError('Confirma tu contraseña');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setRegisterError(null);

    try {
      console.log('Intentando registro con datos:', { username, email, name, password: '***' });
      
      // Llamar a la API de registro
      const userData = await register({
        username,
        email,
        password,
        name
      });
      
      console.log('Registro exitoso:', userData._id);
      
      // Si llega aquí, el registro fue exitoso
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Products' }],
            })
          }
        ]
      );
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Mensaje más descriptivo del error
      let errorMsg = 'Error de conexión. Verifica que el servidor esté activo.';
      
      if (error instanceof Error) {
        errorMsg = error.message;
        
        // Errores comunes
        if (errorMsg.includes('already exists')) {
          errorMsg = 'El usuario o correo electrónico ya está registrado';
        } else if (errorMsg.includes('network')) {
          errorMsg = 'Error de conexión con el servidor. Verifica tu red o que el servidor esté activo.';
        }
      }
      
      setRegisterError(errorMsg);
      
      Alert.alert(
        'Error en el registro',
        errorMsg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://picsum.photos/id/20/200/200' }}
          style={styles.logo}
        />
        <Text style={styles.appName}>Mi Tienda</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Crear Cuenta</Text>
        
        <InputField
          label="Nombre de Usuario"
          value={username}
          onChangeText={setUsername}
          placeholder="Ingrese un nombre de usuario"
          error={usernameError}
        />
        
        <InputField
          label="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="Ingrese su correo electrónico"
          error={emailError}
        />
        
        <InputField
          label="Nombre Completo"
          value={name}
          onChangeText={setName}
          placeholder="Ingrese su nombre completo"
          error={nameError}
        />
        
        <InputField
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Ingrese su contraseña"
          secureTextEntry
          error={passwordError}
        />
        
        <InputField
          label="Confirmar Contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirme su contraseña"
          secureTextEntry
          error={confirmPasswordError}
        />
        
        {registerError && <Text style={styles.errorText}>{registerError}</Text>}
        
        <ButtonPrimary
          title="Registrarse"
          onPress={handleRegister}
          isLoading={loading}
          disabled={loading}
        />
        
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            ¿Ya tienes una cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#3498db',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 40, // Añadir espacio extra al final
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    color: '#e74c3c',
    marginTop: 10,
    marginBottom: 16,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#3498db',
    fontSize: 16,
  },
}); 