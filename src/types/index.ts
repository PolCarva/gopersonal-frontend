export interface User {
  username: string;
  password: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  rating?: {
    rate: number;
    count: number;
  };
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Products: undefined;
  ProductDetail: { productId: number };
  Cart: undefined;
  Profile: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
}; 