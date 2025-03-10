import AsyncStorage from '@react-native-async-storage/async-storage';

// URL del backend - ajustar según tu entorno
// Para emulador Android
const API_URL = 'https://gopersonal-backend-production.up.railway.app/api';
// Para dispositivo físico o iOS, usa tu IP local 
// const API_URL = 'http://192.168.1.X:5000/api'; // Reemplaza X con tu IP
// Para web o iOS usando localhost
// const API_URL = 'http://localhost:5000/api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
}

export interface UserData {
  _id: string;
  username: string;
  email: string;
  name: string;
  profileImage?: string;
  token: string;
}

// Almacenamiento del token
export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem('userToken', token);
  } catch (error) {
    console.error('Error al guardar el token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Error al eliminar el token:', error);
  }
};

// Almacenamiento de datos del usuario
export const storeUserData = async (userData: UserData) => {
  try {
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error al guardar datos del usuario:', error);
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem('userData');
  } catch (error) {
    console.error('Error al eliminar datos del usuario:', error);
  }
};

// API de autenticación
export const login = async (loginData: LoginData): Promise<UserData> => {
  try {
    console.log('Intentando login con:', API_URL, loginData);
    
    // Crear un controlador de aborto para límite de tiempo
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
    
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
      signal: controller.signal,
    });
    
    // Limpiar el timeout ya que la solicitud terminó
    clearTimeout(timeoutId);

    console.log('Respuesta de login:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error de respuesta del servidor' }));
      console.error('Error en respuesta login:', errorData);
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const userData: UserData = await response.json();
    console.log('Login exitoso, datos:', userData);
    
    // Guardar token y datos de usuario
    await storeToken(userData.token);
    await storeUserData(userData);
    
    return userData;
  } catch (error) {
    console.error('Error en login:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo. Comprueba tu conexión a internet y que el servidor esté activo.');
      }
      throw error;
    }
    
    throw new Error('Error inesperado durante el inicio de sesión');
  }
};

export const register = async (registerData: RegisterData): Promise<UserData> => {
  try {
    console.log('Intentando registro con:', API_URL, registerData);
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    console.log('Respuesta de registro:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta registro:', errorData);
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    const userData: UserData = await response.json();
    console.log('Registro exitoso, datos:', userData);
    
    // Guardar token y datos de usuario
    await storeToken(userData.token);
    await storeUserData(userData);
    
    return userData;
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await removeToken();
    await removeUserData();
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

export const updateProfile = async (profileData: any): Promise<UserData> => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    console.log('Actualizando perfil:', profileData);
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error en respuesta de actualización:', errorData);
      throw new Error(errorData.message || 'Error al actualizar perfil');
    }

    const userData: UserData = await response.json();
    
    // Actualizar datos de usuario
    await storeUserData(userData);
    
    return userData;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

export const uploadProfileImage = async (formData: FormData): Promise<{ profileImage: string }> => {
  // Función para intentar la subida con reintentos
  const attemptUpload = async (attempt = 1, maxAttempts = 3): Promise<{ profileImage: string }> => {
    try {
      const token = await getToken();
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      console.log(`Intento ${attempt}/${maxAttempts}: Enviando solicitud de subida de imagen al servidor`);
      const response = await fetch(`${API_URL}/profiles/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      console.log('Respuesta del servidor código:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error en respuesta de subida:', errorData);
        throw new Error(errorData.message || 'Error al subir la imagen');
      }

      const responseData = await response.json();
      console.log('Datos de respuesta del servidor:', responseData);
      
      // También actualizar los datos del usuario en AsyncStorage
      const userData = await getUserData();
      if (userData && responseData.profileImage) {
        userData.profileImage = responseData.profileImage;
        await storeUserData(userData);
        console.log('Datos de usuario actualizados en storage con nueva imagen');
      }
      
      return responseData;
    } catch (error) {
      console.error(`Error en intento ${attempt}/${maxAttempts}:`, error);
      
      // Si es un error de red y no hemos agotado los intentos, reintentamos
      if (
        error instanceof TypeError && 
        error.message.includes('Network') && 
        attempt < maxAttempts
      ) {
        console.log(`Reintentando en 1 segundo... (intento ${attempt + 1}/${maxAttempts})`);
        // Espera 1 segundo antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 1000));
        return attemptUpload(attempt + 1, maxAttempts);
      }
      
      // Si se agotaron los intentos o es otro tipo de error, propagamos el error
      throw error;
    }
  };
  
  // Iniciar el proceso de subida con reintentos
  return attemptUpload();
}; 