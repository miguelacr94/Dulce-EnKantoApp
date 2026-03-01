# Arquitectura SOLID - KiarApp

> Migración a Feature-Based Architecture con principios SOLID

## 🏗️ Estructura del Proyecto

```
src/
├── features/                    # Features del negocio (arquitectura SOLID)
│   ├── pedidos/                # Feature completa de pedidos
│   │   ├── api/
│   │   │   └── pedidos.repository.ts    # Repository Pattern
│   │   ├── hooks/
│   │   │   └── use-pedidos.hook.ts      # React Query hooks
│   │   ├── types/
│   │   │   └── pedido.types.ts          # Domain types
│   │   └── index.ts                     # Barrel export
│   │
│   ├── clientes/               # Feature completa de clientes
│   │   ├── api/
│   │   │   └── clientes.repository.ts
│   │   ├── hooks/
│   │   │   └── use-clientes.hook.ts
│   │   ├── types/
│   │   │   └── cliente.types.ts
│   │   └── index.ts
│   │
│   ├── productos/              # Feature completa de productos
│   │   ├── api/
│   │   │   └── productos.repository.ts
│   │   ├── hooks/
│   │   │   └── use-productos.hook.ts
│   │   ├── types/
│   │   │   └── producto.types.ts
│   │   └── index.ts
│   │
│   └── index.ts                # Barrel export principal (repositories)
│
├── app/                        # Configuración global
│   ├── core/
│   │   └── database/
│   │       └── supabase.ts     # Supabase config
│   ├── navigation/
│   │   └── index.ts            # Navigation barrel export
│   └── store/                  # Zustand store
│
├── shared/                     # Recursos compartidos
│   ├── components/ui/          # UI base
│   ├── hooks/                  # Hooks globales
│   └── utils/                  # Utilidades
│       ├── format.ts
│       └── index.ts            # Barrel export
│
├── screens/                    # Pantallas (screens puras)
├── components/                 # Componentes reutilizables
├── utils/                      # Utilidades legacy
├── hooks/                      # Hooks legacy (backward compat)
├── services/                   # Services legacy (backward compat)
└── types/                      # Types legacy (backward compat)
```

## ✅ Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- Cada archivo tiene una sola responsabilidad
- Repository: acceso a datos
- Hook: lógica de UI y estado
- Types: definición de contratos
- Screen: presentación pura

### 2. Open/Closed Principle (OCP)
- Extensible sin modificar código existente
- Nuevos features pueden agregarse sin tocar los existentes
- Interfaz `IPedidosRepository` permite múltiples implementaciones

### 3. Liskov Substitution Principle (LSP)
- `PedidosRepository` puede sustituir a `IPedidosRepository`
- Interfaces bien definidas para todos los repositories

### 4. Interface Segregation Principle (ISP)
- Interfaces pequeñas y específicas
- `IPedidosRepository` solo tiene métodos relacionados a pedidos
- Tipos específicos por feature

### 5. Dependency Inversion Principle (DIP)
- Screens dependen de hooks, no de repositories directamente
- Hooks dependen de interfaces de repository
- Repository depende de abstracción (Supabase)

## 🔄 Flujo de Datos

```
Screen → Hook → Repository → Supabase
  ↓         ↓          ↓
  UI    Business    Data Access
  Logic    Logic       Layer
```

## 📦 Imports Recomendados

### ✅ Correcto - Importar desde feature específica
```typescript
// Types y hooks desde feature
import { usePedidos, type Pedido } from '@/features/pedidos';
import { useClientes, type Cliente } from '@/features/clientes';
import { useProductos, type Producto } from '@/features/productos';

// Repositories cuando se necesite acceso directo
import { pedidosRepository } from '@/features';
```

### ❌ Evitar - No usar paths relativos largos
```typescript
// Antes (no recomendado)
import { usePedidos } from '../hooks/usePedidos';
import { Pedido } from '../types';
```

## 🎯 Query Keys Optimizadas

Cada feature tiene sus propias query keys para cache de React Query:

```typescript
// features/pedidos
PEDIDOS_QUERY_KEYS = {
  all: ['pedidos'],
  lists: () => ['pedidos', 'list'],
  detail: (id) => ['pedidos', 'detail', id],
  estadisticas: () => ['pedidos', 'estadisticas'],
}

// features/clientes
CLIENTES_QUERY_KEYS = {
  all: ['clientes'],
  lists: () => ['clientes', 'list'],
  detail: (id) => ['clientes', 'detail', id],
}
```

## 🚀 Beneficios

- **Escalabilidad**: Agregar nuevos features es trivial
- **Testeabilidad**: Repositories pueden mockearse fácilmente
- **Mantenibilidad**: Código organizado por dominio
- **Performance**: Query keys optimizadas para cache
- **Type Safety**: Types específicos por feature
- **Developer Experience**: Imports limpios con path aliases

## 📋 Migración Completa

Pantallas actualizadas:
- ✅ DashboardScreen.tsx
- ✅ PedidosScreen.tsx
- ✅ CrearPedidoScreen.tsx
- ✅ EditarPedidoScreen.tsx
- ✅ PedidoDetalleScreen.tsx
- ✅ ClientesScreen.tsx
- ✅ CrearClienteScreen.tsx

## 🔄 Backward Compatibility

Los archivos legacy (`hooks/`, `services/`, `types/`) siguen funcionando para mantener compatibilidad con código no migrado.

## 📝 Notas

- Barrel exports globales solo exportan repositories para evitar colisiones de nombres
- Cada feature tiene su propio barrel export completo
- Path aliases configurados en `tsconfig.json`:
  - `@/*` → `src/*`
  - `@/features/*` → `src/features/*`
  - `@/app/*` → `src/app/*`
  - `@/shared/*` → `src/shared/*`
