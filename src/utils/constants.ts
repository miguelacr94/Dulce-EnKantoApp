// Colores pastel para repostería
export const COLORS = {
  // Colores principales
  primary: '#FF69B4',        // Rosa pastel
  secondary: '#FFB6C1',      // Rosa claro
  accent: '#FFC0CB',          // Rosa muy claro
  
  // Colores de estado
  success: '#32CD32',        // Verde
  warning: '#FFA500',        // Naranja
  error: '#FF6B6B',          // Rojo
  info: '#87CEEB',           // Azul cielo
  
  // Colores de fondo
  background: '#FFF5F5',      // Rosa muy claro de fondo
  cardBackground: '#FFFFFF', // Blanco para cards
  modalBackground: '#FFFFFF', // Blanco para modales
  
  // Colores de texto
  text: '#333333',            // Gris oscuro
  textLight: '#666666',       // Gris medio
  textMuted: '#999999',       // Gris claro
  textWhite: '#FFFFFF',       // Blanco
  
  // Bordes y sombras
  border: '#E0E0E0',          // Gris para bordes
  shadow: 'rgba(0, 0, 0, 0.1)', // Sombra ligera
};

// Tamaños de fuente
export const FONTS = {
  tiny: 10,
  small: 12,
  medium: 14,
  large: 16,
  xlarge: 18,
  xxlarge: 20,
  heading: 24,
  title: 28,
};

// Espaciado
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Sombras
export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
};

// Estados de pedido
export const ESTADOS_PEDIDO = {
  PENDIENTE: 'pendiente',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
} as const;

// Tipos de producto
export const TIPOS_PRODUCTO = {
  TORTA: 'torta',
  CUPCAKE: 'cupcake',
  COMBO: 'combo',
  GALLETAS: 'galletas',
  POSTRES: 'postres',
} as const;

// Opciones de peso para tortas (en libras)
export const PESOS_TORTA = [
  { label: '1/4 libra', value: 0.25 },
  { label: '1/2 libra', value: 0.5 },
  { label: '1 libra', value: 1 },
  { label: '2 libras', value: 2 },
];

// Opciones de cantidad para cupcakes
export const CANTIDADES_CUPCAKE = [
  { label: '6 unidades', value: 6 },
  { label: '12 unidades', value: 12 },
  { label: '24 unidades', value: 24 },
  { label: '36 unidades', value: 36 },
  { label: '48 unidades', value: 48 },
  { label: '60 unidades', value: 60 },
];

// Opciones para combos
export const OPCIONES_COMBO = [
  { label: '1 unidad', value: 1 },
  { label: '2 unidades', value: 2 },
  { label: '4 unidades', value: 4 },
  { label: '6 unidades', value: 6 },
  { label: '8 unidades', value: 8 },
  { label: '12 unidades', value: 12 },
];

// Opciones para galletas
export const CANTIDADES_GALLETAS = [
  { label: '6 unidades', value: 6 },
  { label: '12 unidades', value: 12 },
  { label: '24 unidades', value: 24 },
  { label: '36 unidades', value: 36 },
  { label: '50 unidades', value: 50 },
];

// Opciones para postres
export const OPCIONES_POSTRES = [
  { label: '1 unidad', value: 1 },
  { label: '2 unidades', value: 2 },
  { label: '4 unidades', value: 4 },
  { label: '6 unidades', value: 6 },
  { label: '8 unidades', value: 8 },
  { label: '12 unidades', value: 12 },
];

// Sabores populares
export const SABORES_POPULARES = [
  'Chocolate',
  'Vainilla',
  'Fresa',
  'Arequipe',
  'Mora',
  'Limoncillo',
  'Naranja',
  'Zanahoria',
  'Red Velvet',
  'Tres Leches',
  'Oreo',
  'Nutella',
];

// Validaciones
export const VALIDACIONES = {
  nombre: {
    minLength: 2,
    maxLength: 100,
    required: true,
  },
  telefono: {
    minLength: 10,
    maxLength: 10,
    required: true,
    pattern: /^3\d{9}$/,
  },
  direccion: {
    maxLength: 200,
    required: false,
  },
  descripcion: {
    maxLength: 500,
    required: false,
  },
  precio: {
    min: 0,
    required: true,
  },
  peso: {
    min: 1,
    max: 50,
    required: true,
  },
};
