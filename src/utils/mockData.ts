import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Smartphone XYZ',
    price: 599.99,
    image: 'https://picsum.photos/id/1/300/300',
    description: 'Un smartphone de última generación con todas las características que necesitas.',
    category: 'Electrónica'
  },
  {
    id: 2,
    name: 'Auriculares Bluetooth',
    price: 89.99,
    image: 'https://picsum.photos/id/2/300/300',
    description: 'Auriculares inalámbricos con cancelación de ruido y gran calidad de sonido.',
    category: 'Accesorios'
  },
  {
    id: 3,
    name: 'Tablet Pro',
    price: 349.99,
    image: 'https://picsum.photos/id/3/300/300',
    description: 'Tablet profesional con pantalla de alta resolución y batería de larga duración.',
    category: 'Electrónica'
  },
  {
    id: 4,
    name: 'Smartwatch Sport',
    price: 129.99,
    image: 'https://picsum.photos/id/4/300/300',
    description: 'Reloj inteligente ideal para deportistas con GPS y monitoreo cardíaco.',
    category: 'Wearables'
  },
  {
    id: 5,
    name: 'Cámara Digital HD',
    price: 449.99,
    image: 'https://picsum.photos/id/5/300/300',
    description: 'Cámara digital de alta definición con zoom óptico y múltiples funciones.',
    category: 'Fotografía'
  }
];

export const getProductById = (id: number): Product | undefined => {
  return MOCK_PRODUCTS.find(product => product.id === id);
}; 