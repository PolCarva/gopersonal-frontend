import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { NavigationMenu } from '../components/NavigationMenu';
import { CartProvider } from '../contexts/CartContext';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <CartProvider>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={({ navigation, route }) => ({
            headerStyle: {
              backgroundColor: '#3498db',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerLeft: ({ canGoBack }) => 
              canGoBack ? (
                <TouchableOpacity 
                  onPress={() => navigation.goBack()}
                  style={{ marginRight: 10 }}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
              ) : null,
            headerRight: () => {
              // No mostrar el menú en pantallas de autenticación
              if (route.name === 'Login' || route.name === 'Register') {
                return null;
              }
              
              return (
                <View style={{ marginRight: 10 }}>
                  <NavigationMenu currentScreen={route.name as keyof RootStackParamList} />
                </View>
              );
            },
          })}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ title: 'Registro' }}
          />
          
          <Stack.Screen 
            name="Products" 
            component={ProductsScreen} 
            options={({ navigation }) => ({ 
              title: 'Productos',
              headerBackVisible: false,
              // Mantener el botón de cierre de sesión a la izquierda
              headerLeft: () => (
                <TouchableOpacity 
                  onPress={() => {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'Login' }],
                    });
                  }}
                  style={{ marginRight: 10 }}
                >
                  <Ionicons name="log-out-outline" size={24} color="white" />
                </TouchableOpacity>
              ),
              // Mantener los accesos rápidos a carrito y perfil
              headerRight: () => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 10 }} />
                  <NavigationMenu currentScreen="Products" />
                </View>
              )
            })}
          />
          
          <Stack.Screen 
            name="ProductDetail" 
            component={ProductDetailScreen} 
            options={{ 
              title: 'Detalle del Producto',
            }}
          />
          
          <Stack.Screen 
            name="Cart" 
            component={CartScreen} 
            options={{ 
              title: 'Mi Carrito',
            }}
          />
          
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ 
              title: 'Mi Perfil',
            }}
          />
          
          <Stack.Screen 
            name="Orders" 
            component={OrdersScreen} 
            options={{ 
              title: 'Mis Pedidos',
            }}
          />
          
          <Stack.Screen 
            name="OrderDetail" 
            component={OrderDetailScreen} 
            options={{ 
              title: 'Detalle del Pedido',
            }}
          />
        </Stack.Navigator>
      </CartProvider>
    </NavigationContainer>
  );
} 