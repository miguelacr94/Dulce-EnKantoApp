# Dulce Enkanto - App de Control de Pedidos

Aplicación móvil para gestionar pedidos de repostería (tortas y cupcakes) con React Native, Expo y Supabase.

## 🎯 Características

- ✅ Registro y gestión de clientes
- ✅ Creación y seguimiento de pedidos
- ✅ Sistema de abonos y pagos parciales
- ✅ Cálculo automático de saldos pendientes
- ✅ Filtros por estado de pedidos
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Diseño con colores pastel para repostería
- ✅ Prevención de doble registro
- ✅ Gestión de productos (sabores y tamaños)
- ✅ Modal optimizado con soporte de teclado

## 🛠️ Tecnologías

- **Frontend**: React Native con Expo
- **Backend**: Supabase (Base de datos y API)
- **Estado**: Zustand + React Query
- **Arquitectura**: Feature-based con Repository Pattern
- **Navegación**: React Navigation
- **Lenguaje**: TypeScript
- **Debounce**: Utilidad personalizada para prevención de ejecuciones múltiples

## 📋 Requisitos Previos

1. Node.js (v18 o superior)
2. Expo CLI
3. Cuenta en Supabase

## 🚀 Instalación y Configuración

### 1. Clonar y configurar el proyecto

```bash
# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

### 2. Configurar Supabase

1. Ve a [supabase.com](https://supabase.com) y crea un nuevo proyecto
2. Ejecuta el archivo SQL proporcionado en `supabase-setup.sql`

### 3. Configurar las credenciales de Supabase

1. Ve a la configuración de tu proyecto Supabase
2. Copia la URL y la Anonymous Key
3. Abre el archivo `src/app/core/database/supabase.ts`
4. Reemplaza los valores:

```typescript
const supabaseUrl = 'TU_SUPABASE_URL'; // Reemplaza con tu URL
const supabaseAnonKey = 'TU_SUPABASE_ANON_KEY'; // Reemplaza con tu Anonymous Key
```

## 📱 Ejecutar la Aplicación

```bash
# Iniciar el servidor de desarrollo
npm start

# Escanear el código QR con la app Expo Go
# O ejecutar en un emulador:
npm run android
# o
npm run ios
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # Configuración principal de la app
│   ├── core/              # Configuración centralizada
│   │   ├── database/      # Configuración de Supabase
│   │   ├── errors/       # Manejo de errores
│   │   ├── logging/      # Sistema de logging
│   │   └── validation/    # Esquemas de validación
│   ├── navigation/        # Configuración de navegación
│   └── store/           # Estado global con Zustand
├── features/             # Módulos por funcionalidad
│   ├── pedidos/          # Gestión de pedidos
│   │   ├── api/          # Repository y servicios
│   │   ├── components/   # Componentes específicos
│   │   ├── hooks/        # Hooks personalizados
│   │   ├── screens/      # Pantallas
│   │   └── types/        # Tipos de datos
│   ├── productos/        # Gestión de productos
│   │   ├── api/          # Repository de productos
│   │   ├── hooks/        # Hooks de productos
│   │   ├── screens/      # Pantallas de gestión
│   │   └── types/        # Tipos de productos
│   └── configuracion/    # Configuración de la app
│       └── screens/      # Pantallas de configuración
├── shared/               # Componentes y utilidades compartidas
│   ├── components/       # UI reutilizable
│   │   └── ui/          # Componentes genéricos
│   └── hooks/           # Hooks compartidos
├── utils/                # Utilidades generales
│   ├── debounce.ts      # Utilidad de debounce
│   ├── format.ts        # Funciones de formato
│   └── index.ts         # Exportaciones
├── providers/            # Providers de React
│   └── QueryProvider.tsx # Configuración de React Query
└── types/               # Tipos globales
    └── index.ts         # Exportaciones de tipos
```

## 🏛️ Arquitectura

### Feature-Based Architecture
El proyecto está organizado por características (features) para mejor mantenibilidad:

- **Pedidos**: Gestión completa de pedidos con su propia API, componentes y hooks
- **Productos**: Administración de productos, sabores y tamaños
- **Configuración**: Settings y preferencias de la aplicación

### Repository Pattern
Cada feature tiene su propio repository para separar la lógica de negocio:

```typescript
// Ejemplo de uso
const { createPedido, isCreating } = usePedidos();
```

### Estado Global
- **Zustand**: Para estado global simple
- **React Query**: Para caché y estado del servidor
- **Hooks personalizados**: Para lógica reutilizable

## 🎨 Diseño y UI

- **Colores**: Paleta pastel rosa adecuada para repostería
- **Estados**: Indicadores visuales claros para pendiente/entregado/cancelado
- **Tipografía**: Jerarquía clara con diferentes tamaños de fuente
- **Sombras**: Efectos de sombra sutiles para dar profundidad
- **Modales optimizados**: Con KeyboardAvoidingView para mejor UX

## 🔧 Funcionalidades Principales

### Dashboard
- Resumen de pedidos por estado
- Total de dinero pendiente por cobrar
- Lista de próximos pedidos a entregar
- Acciones rápidas para crear pedidos

### Gestión de Pedidos
- Crear pedidos con múltiples items
- Sistema de abonos parciales
- **Prevención de doble registro** con debounce
- Filtros y búsqueda avanzada
- Cambio de estado con validaciones

### Gestión de Productos
- Administración de productos
- Gestión de sabores por producto
- Configuración de tamaños (por peso o unidad)
- Validaciones específicas por tipo

### Mejoras UX
- **Modal optimizado**: Los campos permanecen visibles sobre el teclado
- **Cards mejoradas**: Orden lógico (abono arriba, restante abajo)
- **Navegación fluida**: Sin bloqueos por doble registro

## 🚀 Despliegue

### Para desarrollo
```bash
npm start
```

### Para producción
```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios
```

## 📝 Mejoras Recientes

### v1.1.0 - Optimización y Prevención de Errores
- ✅ Sistema de prevención de doble registro
- ✅ Modal de items con KeyboardAvoidingView
- ✅ Nueva arquitectura feature-based
- ✅ Repository pattern implementado
- ✅ BundleIdentifier configurado para iOS
- ✅ Utilidad debounce para prevención de ejecuciones múltiples

## 🐛 Solución de Problemas

### Problemas comunes:
1. **Error de conexión**: Verifica que las credenciales de Supabase sean correctas
2. **Error de RLS**: Asegúrate de que las políticas de Row Level Security estén configuradas
3. **Error de tipos**: Ejecuta `npm install --save-dev @types/react @types/react-native` si tienes errores de TypeScript
4. **Doble registro**: El sistema ahora previene registros duplicados automáticamente
5. **Teclado oculta campos**: Los modales ahora ajustan automáticamente el layout

## 🤝 Contribuciones

1. Fork del proyecto
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
