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
import { CartIcon } from '../components/CartIcon';
import { ProfileIcon } from '../components/ProfileIcon';
import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={({ navigation }) => ({
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
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <ProfileIcon />
                <CartIcon />
              </View>
            )
          })}
        />
        
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen} 
          options={{ 
            title: 'Detalle del Producto',
            headerRight: () => (
              <View style={{ flexDirection: 'row' }}>
                <ProfileIcon />
                <CartIcon />
              </View>
            )
          }}
        />
        
        <Stack.Screen 
          name="Cart" 
          component={CartScreen} 
          options={{ 
            title: 'Mi Carrito'
          }}
        />
        
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ 
            title: 'Mi Perfil'
          }}
        />
        
        <Stack.Screen 
          name="Orders" 
          component={OrdersScreen} 
          options={{ 
            title: 'Mis Pedidos'
          }}
        />
        
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen} 
          options={{ 
            title: 'Detalle del Pedido'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 