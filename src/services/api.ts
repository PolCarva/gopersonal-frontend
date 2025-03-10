import { Product } from '../types';

const BASE_URL = 'https://fakestoreapi.com';

export interface ApiProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

// Función para transformar los datos de la API al formato utilizado en nuestra app
const mapApiProductToProduct = (apiProduct: ApiProduct): Product => {
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    price: apiProduct.price,
    description: apiProduct.description,
    category: apiProduct.category,
    image: apiProduct.image,
    rating: apiProduct.rating
  };
};

// Obtener todos los productos
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products`);
    
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    
    const data: ApiProduct[] = await response.json();
    return data.map(mapApiProductToProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Obtener un producto por su ID
export const fetchProductById = async (id: number): Promise<Product> => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener el producto con ID ${id}`);
    }
    
    const data: ApiProduct = await response.json();
    return mapApiProductToProduct(data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// Obtener las categorías de productos
export const fetchCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${BASE_URL}/products/categories`);
    
    if (!response.ok) {
      throw new Error('Error al obtener categorías');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}; 