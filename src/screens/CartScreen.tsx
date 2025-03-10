import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ButtonPrimary } from '../components/ButtonPrimary';
import { useCartContext } from '../contexts/CartContext';
import { createOrder, transformCartToOrderItems } from '../services/orderApi';
import { getUserData } from '../services/authApi';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useCallback } from 'react';

type CartScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

export function CartScreen() {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { 
    items, 
    loading: cartLoading, 
    error: cartError, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice,
    refreshCart
  } = useCartContext();
  const [loading, setLoading] = useState(false);

  // Usar useFocusEffect para recargar el carrito cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [])
  );

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
      const createdOrder = await createOrder({
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

      // Limpiar el carrito
      await clearCart();

      // Mostrar mensaje de éxito y navegar a la pantalla de órdenes
      Alert.alert(
        'Pedido Realizado',
        '¡Gracias por tu compra! Tu pedido ha sido procesado correctamente.',
        [
          { 
            text: 'Ver mi pedido', 
            onPress: () => {
              console.log('Navegando al detalle del pedido con ID:', createdOrder._id);
              // Navegar a los detalles del pedido recién creado
              // Usamos reset para evitar problemas de navegación
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'Products' },
                  { name: 'OrderDetail', params: { orderId: createdOrder._id } }
                ],
              });
            }
          },
          {
            text: 'Ver todos mis pedidos',
            onPress: () => {
              console.log('Navegando a la lista de pedidos desde el carrito');
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'Products' },
                  { name: 'Orders' }
                ],
              });
            }
          }
        ]
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

  // Mostrar pantalla de carga cuando el carrito está cargando inicialmente
  if (cartLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  // Mostrar pantalla de error si hay un error y el carrito está vacío
  if (cartError && items.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#e74c3c" />
        <Text style={styles.errorText}>{cartError}</Text>
        <Text style={styles.errorSubtext}>
          Es posible que el servidor no esté disponible o que haya problemas de conexión.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshCart}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#bdc3c7" />
        <Text style={styles.emptyText}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtext}>
          Agrega algunos productos para comenzar a comprar
        </Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('Products')}
        >
          <Text style={styles.shopButtonText}>Ir a Productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Mi Carrito</Text>
      
      {/* Mostrar indicador de sincronización si está cargando */}
      {cartLoading && (
        <View style={styles.syncContainer}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.syncText}>Sincronizando...</Text>
        </View>
      )}
      
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
                  disabled={item.quantity <= 1 || loading || cartLoading}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                
                <Text style={styles.quantityText}>{item.quantity}</Text>
                
                <TouchableOpacity 
                  style={styles.quantityButton}
                  onPress={() => handleIncreaseQuantity(item.product.id, item.quantity)}
                  disabled={loading || cartLoading}
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
                disabled={loading || cartLoading}
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
          disabled={loading || cartLoading}
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
    marginBottom: 20,
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
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#333',
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  removeButton: {
    padding: 5,
  },
  footer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#95a5a6',
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: '#e8f4fc',
    borderRadius: 8,
  },
  syncText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#3498db',
  },
}); 