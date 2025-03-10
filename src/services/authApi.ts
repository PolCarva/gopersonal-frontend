import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:5000/api'; // Para emulador Android localhost

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
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al iniciar sesión');
    }

    const userData: UserData = await response.json();
    
    // Guardar token y datos de usuario
    await storeToken(userData.token);
    await storeUserData(userData);
    
    return userData;
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

export const register = async (registerData: RegisterData): Promise<UserData> => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar usuario');
    }

    const userData: UserData = await response.json();
    
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
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    
    const response = await fetch(`${API_URL}/profiles/upload-photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al subir la imagen');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al subir imagen de perfil:', error);
    throw error;
  }
}; 