# Tienda App

Aplicación de comercio electrónico móvil desarrollada con React Native, Expo y TypeScript.

## Características Principales

- Autenticación completa con JWT
- Catálogo de productos con filtros y búsqueda avanzada
- Gestión de carrito de compras en tiempo real
- Proceso de checkout optimizado
- Historial de pedidos detallado
- Perfil de usuario personalizable con carga de imágenes
- Modo oscuro/claro con cambio automático
- Soporte multiidioma (Español/Inglés)
- Notificaciones push personalizadas
- Animaciones fluidas con Reanimated
- Sincronización offline-first
- Pagos integrados con Stripe
- Favoritos y listas de deseos
- Reseñas y calificaciones de productos
- Escaneo de códigos QR/barras

## Tecnologías Utilizadas

- React Native
- Expo
- TypeScript
- Redux Toolkit para manejo de estados
- React Navigation para navegación
- Axios para peticiones HTTP
- AsyncStorage para almacenamiento local
- Expo Image Picker para selección de imágenes
- React Native Paper para componentes UI
- Formik y Yup para manejo y validación de formularios

## Estructura del Proyecto

```
tienda-app/
├── assets/           # Imágenes, fuentes y recursos estáticos
├── src/
│   ├── api/          # Configuración de API y servicios
│   ├── components/   # Componentes reutilizables
│   ├── constants/    # Constantes y configuración
│   ├── hooks/        # Custom hooks
│   ├── navigation/   # Configuración de navegación
│   ├── redux/        # Estado global (slices, store)
│   ├── screens/      # Pantallas de la aplicación
│   ├── services/     # Servicios para autenticación, etc.
│   ├── types/        # Definiciones de TypeScript
│   └── utils/        # Funciones utilitarias
├── .env              # Variables de entorno (no incluidas en el repo)
├── App.tsx           # Punto de entrada de la aplicación
└── package.json      # Dependencias del proyecto
```

## Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI
- Backend API en ejecución (ver repositorio backend)

## Instalación

1. Clona este repositorio
   ```bash
   git clone https://github.com/PolCarva/gopersonal-frontend.git
   cd tienda-app
   ```

2. Instala las dependencias
   ```bash
   npm install
   # o
   yarn install
   ```

3. Inicia el servidor de desarrollo
   ```bash
   npm start
   # o
   yarn start
   ```

4. Escanea el código QR con la app Expo Go en tu dispositivo o ejecuta en un emulador
   ```bash
   npm run android
   # o
   npm run ios
   ```

## Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo Expo
- `npm run android` - Ejecuta la app en un emulador/dispositivo Android
- `npm run ios` - Ejecuta la app en un simulador/dispositivo iOS

## Autenticación

La aplicación utiliza tokens JWT para la autenticación:

1. Al iniciar sesión o registrarse, se obtiene un token de la API
2. El token se almacena en AsyncStorage
3. Todas las peticiones subsecuentes incluyen el token en el header de autorización
4. Manejamos la expiración del token redirigiendo al usuario a la pantalla de login

## Pantallas Principales

- **Login/Registro**: Acceso y creación de cuentas
- **Home**: Showcase de productos destacados
- **Catálogo**: Lista completa de productos con filtros
- **Detalle de Producto**: Información detallada y opciones de compra
- **Carrito**: Gestión de items seleccionados para compra
- **Checkout**: Proceso de pago y finalización de compra
- **Pedidos**: Historial y detalles de pedidos realizados
- **Perfil**: Información del usuario y opciones de configuración

## Integración con Backend

La aplicación se comunica con el backend a través de una API RESTful:

- Autenticación mediante `/api/users/login` y `/api/users/register`
- Gestión del perfil con `/api/profiles`
- Manejo de pedidos con `/api/orders`
- Gestión del carrito con `/api/carts`

## Despliegue

### Para generar una build de Android:

1. Configura la versión en `app.json`
2. Ejecuta:
   ```bash
   expo build:android -t apk  # Para obtener un APK
   # o
   expo build:android -t app-bundle  # Para Google Play Store
   ```

### Para generar una build de iOS:

1. Configura la versión en `app.json`
2. Ejecuta:
   ```bash
   expo build:ios -t archive  # Para App Store
   # o
   expo build:ios -t simulator  # Para probar en simulador
   ```

## Resolución de Problemas Comunes

- **Error de conexión a la API**: Verifica que el backend esté ejecutándose y que la URL en el archivo `.env` sea correcta
- **Problemas con la carga de imágenes**: Asegúrate de tener los permisos correctos en tu dispositivo
- **Tokens expirados**: La sesión se cerrará automáticamente cuando el token expire, vuelve a iniciar sesión
