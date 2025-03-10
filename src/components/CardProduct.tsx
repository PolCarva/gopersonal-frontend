import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';

interface CardProductProps {
  product: Product;
  onPress: () => void;
}

export function CardProduct({ product, onPress }: CardProductProps) {
  // Obtener los valores seguros para el rating
  const rating = product.rating || { rate: 0, count: 0 };
  const rateValue = rating.rate || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.round(rateValue) ? "star" : "star-outline"}
                size={12}
                color="#f39c12"
                style={styles.star}
              />
            ))}
          </View>
          <Text style={styles.ratingText}>{rateValue.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
    width: '47%',
    marginHorizontal: '1.5%',
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    backgroundColor: '#fff',
    padding: 10,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#333',
    height: 40,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    marginRight: 4,
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#7f8c8d',
  }
}); 