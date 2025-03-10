import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useCartContext } from '../contexts/CartContext';
import { createOrder, transformCartToOrderItems } from '../services/orderApi';
import { getUserData } from '../services/authApi';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export function CartScreen() {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice 
  } = useCartContext();
  const [loading, setLoading] = useState(false);

  const handleRemoveItem = (productId: number) => {
    removeFromCart(productId);
  };

  const handleIncreaseQuantity = (productId: number, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (productId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const handleCheckout = async () => {
    try {
      // Verificar si el usuario está autenticado
      const userData = await getUserData();
      
      if (!userData) {
        Alert.alert(
          'Inicio de sesión requerido',
          'Necesitas iniciar sesión para realizar un pedido',
          [
            { 
              text: 'Iniciar sesión',
              onPress: () => navigation.navigate('Login')
            },
            { 
              text: 'Cancelar',
              style: 'cancel'
            }
          ]
        );
        return;
      }

      setLoading(true);

      // Transformar los items del carrito al formato esperado por la API
      const orderItems = transformCartToOrderItems(items);
      
      // Crear el pedido en el backend
      await createOrder({
        items: orderItems,
        totalAmount: getTotalPrice(),
        paymentMethod: 'tarjeta', // Por defecto
        shippingAddress: {
          street: 'Dirección de ejemplo',
          city: 'Ciudad',
          postalCode: '12345',
          country: 'País'
        }
      });

      // Limpiar el carrito y mostrar mensaje de éxito
      clearCart();

      Alert.alert(
        'Pedido Realizado',
        '¡Gracias por tu compra! Tu pedido ha sido procesado correctamente y guardado en nuestra base de datos.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error al realizar el pedido:', error);
      Alert.alert(
        'Error',
        'Ha ocurrido un error al procesar tu pedido. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#bdc3c7" />
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtext}>
          Agrega algunos productos para comenzar a comprar
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi Carrito</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.product.image }} style={styles.thumbnail} />
            
            <View style={styles.itemDetails}>
              <Text style={styles.productName}>{item.product.name}</Text>
              <Text style={styles.productPrice}>${item.product.price.toFixed(2)}</Text>
              
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleDecreaseQuantity(item.product.id, item.quantity)}
                  disabled={item.quantity <= 1 || loading}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleIncreaseQuantity(item.product.id, item.quantity)}
                  disabled={loading}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.itemActions}>
              <Text style={styles.itemTotal}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
              
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveItem(item.product.id)}
                disabled={loading}
              >
                <Ionicons name="trash-outline" size={22} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        
        <ButtonPrimary
          title={loading ? "Procesando..." : "Realizar Pedido"}
          onPress={handleCheckout}
          isLoading={loading}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#7f8c8d',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#95a5a6',
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  productPrice: {
    fontSize: 15,
    color: '#7f8c8d',
    marginVertical: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#3498db',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  removeButton: {
    padding: 5,
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
}); 