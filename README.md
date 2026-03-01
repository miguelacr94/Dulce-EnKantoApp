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

## 🛠️ Tecnologías

- **Frontend**: React Native con Expo
- **Backend**: Supabase (Base de datos y API)
- **Estado**: Zustand
- **Consultas**: React Query
- **Navegación**: React Navigation
- **Lenguaje**: TypeScript

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
2. Ejecuta el siguiente SQL en el editor SQL de Supabase:

```sql
-- Crear tabla de clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  direccion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de pedidos
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo_producto TEXT NOT NULL CHECK (tipo_producto IN ('torta', 'cupcake')),
  peso NUMERIC NOT NULL CHECK (peso > 0),
  sabor TEXT NOT NULL,
  descripcion TEXT,
  precio_total NUMERIC NOT NULL CHECK (precio_total > 0),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'entregado', 'cancelado')),
  fecha_entrega DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de abonos
CREATE TABLE abonos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  monto NUMERIC NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_pedidos_fecha_entrega ON pedidos(fecha_entrega);
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_abonos_pedido_id ON abonos(pedido_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (permitir todo para esta app simple)
CREATE POLICY "Allow all operations on clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pedidos" ON pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on abonos" ON abonos FOR ALL USING (true) WITH CHECK (true);
```

### 3. Configurar las credenciales de Supabase

1. Ve a la configuración de tu proyecto Supabase
2. Copia la URL y la Anonymous Key
3. Abre el archivo `src/services/supabase.ts`
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
├── components/          # Componentes reutilizables
├── screens/            # Pantallas de la aplicación
│   ├── DashboardScreen.tsx
│   ├── ClientesScreen.tsx
│   ├── PedidosScreen.tsx
│   ├── CrearPedidoScreen.tsx
│   ├── PedidoDetalleScreen.tsx
│   ├── ClienteDetalleScreen.tsx
│   └── CrearClienteScreen.tsx
├── services/          # Servicios de API
│   ├── supabase.ts
│   ├── clientesService.ts
│   ├── pedidosService.ts
│   └── abonosService.ts
├── navigation/         # Configuración de navegación
│   └── AppNavigator.tsx
├── store/             # Manejo de estado con Zustand
│   └── appStore.ts
├── hooks/             # Hooks personalizados
│   ├── useClientes.ts
│   ├── usePedidos.ts
│   └── useAbonos.ts
├── providers/         # Providers de React
│   └── QueryProvider.tsx
├── utils/             # Utilidades y constantes
│   ├── constants.ts
│   └── format.ts
└── types/             # Tipos de TypeScript
    └── index.ts
```

## 🎨 Diseño y UI

- **Colores**: Paleta pastel rosa adecuada para repostería
- **Estados**: Indicadores visuales claros para pendiente/entregado/cancelado
- **Tipografía**: Jerarquía clara con diferentes tamaños de fuente
- **Sombras**: Efectos de sombra sutiles para dar profundidad

## 🔧 Funcionalidades Principales

### Dashboard
- Resumen de pedidos por estado
- Total de dinero pendiente por cobrar
- Lista de próximos pedidos a entregar
- Acciones rápidas para crear pedidos y clientes

### Gestión de Clientes
- Crear, editar y eliminar clientes
- Validación de teléfono colombiano
- Historial completo de pedidos por cliente
- Estadísticas de consumo

### Gestión de Pedidos
- Crear pedidos con abono inicial
- Filtros por estado (pendiente/entregado/cancelado)
- Búsqueda por cliente, sabor o descripción
- Cambio de estado con validaciones

### Sistema de Abonos
- Agregar abonos parciales a pedidos
- Validación que los abonos no superen el precio total
- Cálculo automático de saldo pendiente
- Historial completo de abonos por pedido

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

## 📝 Notas Importantes

1. **Seguridad**: Esta app usa la anonymous key de Supabase. Para producción considera implementar autenticación.
2. **RLS**: Las políticas de Row Level Security están configuradas para permitir todo. Ajusta según tus necesidades.
3. **Validaciones**: La app incluye validaciones frontend pero considera agregar validaciones backend adicionales.
4. **Offline**: Actualmente la app requiere conexión a internet. Considera agregar soporte offline con AsyncStorage.

## 🐛 Solución de Problemas

### Problemas comunes:
1. **Error de conexión**: Verifica que las credenciales de Supabase sean correctas
2. **Error de RLS**: Asegúrate de que las políticas de Row Level Security estén configuradas
3. **Error de tipos**: Ejecuta `npm install --save-dev @types/react @types/react-native` si tienes errores de TypeScript

## 🤝 Contribuciones

1. Fork del proyecto
2. Crear una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
# Dulce-EnKantoApp
