import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationMenuProps = {
  currentScreen: keyof RootStackParamList;
};

export function NavigationMenu({ currentScreen }: NavigationMenuProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [menuVisible, setMenuVisible] = useState(false);

  const navigateTo = (screen: keyof RootStackParamList) => {
    // No navegar si ya estamos en esa pantalla
    if (screen === currentScreen) {
      setMenuVisible(false);
      return;
    }
    
    setMenuVisible(false);
    console.log(`Navegando desde ${currentScreen} a ${screen}`);
    
    // Navegar de forma específica según la pantalla
    switch(screen) {
      case 'Products':
        navigation.navigate('Products');
        break;
      case 'Profile':
        navigation.navigate('Profile');
        break;
      case 'Cart':
        navigation.navigate('Cart');
        break;
      case 'Orders':
        navigation.navigate('Orders');
        break;
      case 'Login':
        // Para cerrar sesión, redirigimos al login reseteando el stack
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        break;
      case 'OrderDetail':
        // No debería navegar directamente a OrderDetail desde el menú
        console.warn('No se puede navegar directamente a OrderDetail desde el menú');
        break;
      case 'Register':
        navigation.navigate('Register');
        break;
      case 'ProductDetail':
        // No debería navegar directamente a ProductDetail desde el menú
        console.warn('No se puede navegar directamente a ProductDetail desde el menú');
        break;
    }
  };

  const renderMenuItem = (
    screen: keyof RootStackParamList, 
    label: string, 
    icon: string,
    showDivider = true
  ) => {
    // No mostrar la opción para la pantalla actual
    if (screen === currentScreen) return null;

    return (
      <>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => navigateTo(screen)}
        >
          <Ionicons name={icon as any} size={24} color="#3498db" />
          <Text style={styles.menuItemText}>{label}</Text>
        </TouchableOpacity>
        {showDivider && <View style={styles.divider} />}
      </>
    );
  };

  return (
    <View>
      {/* Botón para abrir el menú */}
      <TouchableOpacity onPress={() => setMenuVisible(true)}>
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal con el menú desplegable */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                {renderMenuItem('Products', 'Inicio', 'home-outline')}
                {renderMenuItem('Profile', 'Mi Perfil', 'person-outline')}
                {renderMenuItem('Cart', 'Mi Carrito', 'cart-outline')}
                {renderMenuItem('Orders', 'Mis Pedidos', 'list-outline')}
                {renderMenuItem('Login', 'Cerrar Sesión', 'log-out-outline', false)}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    marginRight: 16,
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f1f1',
    marginHorizontal: 16,
  }
}); 