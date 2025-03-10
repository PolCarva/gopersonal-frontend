import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUserData, uploadProfileImage, updateProfile, logout } from '../services/authApi';
import { getUserOrders } from '../services/orderApi';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { InputField } from '../components/InputField';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import * as ImagePicker from 'react-native-image-picker';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

interface ProfileData {
  _id: string;
  username: string;
  email: string;
  name: string;
  profileImage: string;
}

export function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [editing, setEditing] = useState(false);
  
  // Estados para el formulario de edición
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    loadUserData();
    loadOrders();
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserData();
      if (data) {
        setUserData({
          _id: data._id,
          username: data.username,
          email: data.email,
          name: data.name || '',
          profileImage: data.profileImage || 'https://via.placeholder.com/150'
        });
        setName(data.name || '');
        setEmail(data.email);
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const loadOrders = async () => {
    try {
      const orders = await getUserOrders();
      setOrderCount(orders.length);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      // No mostramos error para no interrumpir la carga del perfil
    }
  };
  
  const handleSelectImage = async () => {
    try {
      const options: ImagePicker.ImageLibraryOptions = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 800,
        maxWidth: 800,
      };

      const response = await ImagePicker.launchImageLibrary(options);
      
      if (response.didCancel) {
        return;
      }
      
      if (response.errorCode) {
        Alert.alert('Error', 'Ha ocurrido un error al seleccionar la imagen');
        return;
      }
      
      if (response.assets && response.assets[0].uri) {
        uploadImage(response.assets[0]);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };
  
  const uploadImage = async (image: ImagePicker.Asset) => {
    try {
      setImageLoading(true);
      
      const formData = new FormData();
      formData.append('profileImage', {
        name: image.fileName || 'photo.jpg',
        type: image.type,
        uri: Platform.OS === 'ios' ? image.uri?.replace('file://', '') : image.uri,
      } as any);
      
      const result = await uploadProfileImage(formData);
      
      if (userData && result.profileImage) {
        setUserData({
          ...userData,
          profileImage: result.profileImage
        });
        
        // Recargar datos del usuario
        await loadUserData();
      }
      
      Alert.alert('Éxito', 'Imagen de perfil actualizada correctamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      Alert.alert('Error', 'No se pudo subir la imagen de perfil');
    } finally {
      setImageLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Validación básica
      if (!name.trim() || !email.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
      
      await updateProfile({ name, email });
      
      // Recargar datos del usuario
      await loadUserData();
      
      setEditing(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };
  
  if (loading && !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }
  
  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No se pudo cargar el perfil.</Text>
        <TouchableOpacity onPress={loadUserData}>
          <Text style={styles.retryText}>Intentar nuevamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {imageLoading ? (
            <ActivityIndicator size="large" color="#fff" style={styles.imageLoading} />
          ) : (
            <Image 
              source={{ uri: userData.profileImage }} 
              style={styles.profileImage} 
            />
          )}
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={handleSelectImage}
            disabled={imageLoading}
          >
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.username}>@{userData.username}</Text>
      </View>
      
      <View style={styles.content}>
        {editing ? (
          // Formulario de edición
          <View style={styles.editForm}>
            <InputField
              label="Nombre"
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre completo"
            />
            
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Tu correo electrónico"
            />
            
            <View style={styles.buttonGroup}>
              <ButtonPrimary
                title="Guardar"
                onPress={handleSaveProfile}
                isLoading={loading}
              />
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setEditing(false);
                  setName(userData.name);
                  setEmail(userData.email);
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Vista de información
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Información personal</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{userData.name || 'No especificado'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{userData.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pedidos:</Text>
                <Text style={styles.infoValue}>{orderCount}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setEditing(true)}
              >
                <Ionicons name="create-outline" size={20} color="#3498db" />
                <Text style={styles.editButtonText}>Editar perfil</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.actionsSection}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Orders')}
              >
                <Ionicons name="list" size={24} color="#3498db" />
                <Text style={styles.actionButtonText}>Mis Pedidos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#e74c3c" />
                <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#3498db',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  imageLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  content: {
    padding: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  infoLabel: {
    width: 100,
    fontSize: 16,
    color: '#7f8c8d',
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  editButtonText: {
    color: '#3498db',
    fontSize: 16,
    marginLeft: 5,
  },
  actionsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  editForm: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  buttonGroup: {
    marginTop: 10,
  },
  cancelButton: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#e74c3c',
  },
  retryText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 