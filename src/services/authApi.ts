import AsyncStorage from '@react-native-async-storage/async-storage';

// URL del backend - ajustar según tu entorno
const API_URL = 'https://gopersonal-backend-production.up.railway.app/api';
// URL para desarrollo local (descomentar según necesidad)
// const API_URL = 'http://10.0.2.2:5000/api'; // Para emulador Android
// const API_URL = 'http://192.168.1.X:5000/api'; // Para dispositivo físico (reemplaza X con tu IP)
// const API_URL = 'http://localhost:5000/api'; // Para web o iOS

// Variable global para almacenar el token en memoria
let memoryToken: string | null = null;

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
    // Guardar en memoria y AsyncStorage
    memoryToken = token;
    await AsyncStorage.setItem('userToken', token);
    console.log('Token guardado en memoria y AsyncStorage');
  } catch (error) {
    console.error('Error al guardar el token:', error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    // Primero intentar obtener de memoria para evitar operaciones async
    if (memoryToken) {
      return memoryToken;
    }
    
    // Si no está en memoria, buscar en AsyncStorage
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // Actualizar variable en memoria
      memoryToken = token;
    }
    return token;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    // Limpiar memoria y AsyncStorage
    memoryToken = null;
    await AsyncStorage.removeItem('userToken');
    console.log('Token eliminado de memoria y AsyncStorage');
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

// Helper para obtener headers autorizados
export const getAuthHeaders = async () => {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
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
    
    // Verificar que el token existe
    if (!userData.token) {
      console.error('Error: El servidor no devolvió un token de autenticación');
      throw new Error('No se recibió un token de autenticación válido');
    }
    
    console.log('Token recibido (primeros 15 caracteres):', userData.token.substring(0, 15) + '...');
    
    // Guardar token y datos de usuario
    await storeToken(userData.token);
    await storeUserData(userData);
    
    // Verificar que el token se guardó correctamente
    const storedToken = await getToken();
    if (storedToken) {
      console.log('Token guardado correctamente');
    } else {
      console.error('Error: No se pudo verificar el token guardado');
    }
    
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
      console.log('URL de destino:', `${API_URL}/profiles/upload-photo`);
      
      // Log para ver qué contiene el FormData
      console.log('Contenido de FormData:');
      // Usar cualquier para evitar el error en TypeScript con FormData.entries()
      const formDataAny = formData as any;
      for (let [key, value] of formDataAny.entries()) {
        if (value instanceof Blob) {
          console.log(`${key}: Blob/Archivo (tamaño: ${value.size} bytes, tipo: ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Usar fetch con un timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
      
      const response = await fetch(`${API_URL}/profiles/upload-photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });
      
      // Limpiar el timeout ya que la solicitud terminó
      clearTimeout(timeoutId);
      
      console.log('Respuesta del servidor código:', response.status);
      console.log('Headers de respuesta:', JSON.stringify([...response.headers.entries()]));
      
      // Para errores 500, intentar leer el texto de respuesta directamente
      if (response.status === 500) {
        const errorText = await response.text();
        console.error('Error 500 del servidor, respuesta completa:', errorText);
        
        // Si estamos en el último intento, lanzar error con el texto de respuesta
        if (attempt >= maxAttempts) {
          throw new Error(`Error del servidor (500): ${errorText}`);
        }
        
        // Reintentar después de un error 500
        console.log(`Reintentando después de error 500... (intento ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
        return attemptUpload(attempt + 1, maxAttempts);
      }
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error('Error en respuesta de subida:', errorData);
          throw new Error(errorData.message || 'Error al subir la imagen');
        } catch (jsonError) {
          // Si no se puede parsear como JSON, usar el texto directamente
          const errorText = await response.text();
          console.error('Error en respuesta (no es JSON):', errorText);
          throw new Error(`Error al subir la imagen: ${response.status} - ${errorText}`);
        }
      }

      try {
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
      } catch (jsonError) {
        console.error('Error al parsear respuesta JSON:', jsonError);
        const responseText = await response.text();
        console.log('Respuesta como texto:', responseText);
        throw new Error('La respuesta del servidor no es JSON válido');
      }
    } catch (error) {
      console.error(`Error en intento ${attempt}/${maxAttempts}:`, error);
      
      // Si es un error de red y no hemos agotado los intentos, reintentamos
      if (
        (error instanceof TypeError && error.message.includes('Network') || 
         (error as any).name === 'AbortError') && 
        attempt < maxAttempts
      ) {
        console.log(`Reintentando en 2 segundos... (intento ${attempt + 1}/${maxAttempts})`);
        // Espera 2 segundos antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 2000));
        return attemptUpload(attempt + 1, maxAttempts);
      }
      
      // Si se agotaron los intentos o es otro tipo de error, propagamos el error
      throw error;
    }
  };
  
  // Iniciar el proceso de subida con reintentos
  return attemptUpload();
};

// Función para refrescar el token cuando sea necesario
export const refreshToken = async (): Promise<boolean> => {
  try {
    console.log('Intentando refrescar token...');
    
    // Obtener los datos del usuario de AsyncStorage
    const userData = await getUserData();
    if (!userData || !userData.token) {
      console.error('No hay datos de usuario o token para refrescar');
      return false;
    }
    
    // Asegurarse de que el token está actualizado en memoria y AsyncStorage
    memoryToken = userData.token;
    await AsyncStorage.setItem('userToken', userData.token);
    
    console.log('Token refrescado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al refrescar token:', error);
    return false;
  }
}; 