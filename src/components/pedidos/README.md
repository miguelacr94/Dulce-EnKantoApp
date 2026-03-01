# Componentes de Pedidos

Esta carpeta contiene componentes reutilizables relacionados con la gestión de pedidos que pueden ser utilizados en diferentes partes de la aplicación.

## 📁 Estructura

```
pedidos/
├── ItemModal.tsx           # Modal para agregar/editar items de pedidos
├── ItemsList.tsx           # Lista de items con acciones CRUD
├── OrderSummary.tsx        # Resumen financiero del pedido
├── ClienteSelector.tsx     # Selector de clientes
├── usePedidoForm.tsx       # Hook personalizado para gestión de formularios
├── index.ts                # Exportaciones del módulo
└── README.md               # Documentación
```

## 🎯 Componentes

### ItemModal
Modal completo para agregar y editar items de pedidos con selección dinámica de productos, sabores y tamaños.

**Props:**
- `visible`: boolean - Controla la visibilidad del modal
- `editingItem`: boolean - Indica si se está editando o creando
- `tempItem`: Omit<PedidoItem, 'id' | 'pedido_id'> - Item temporal
- `productos`: Producto[] - Lista de productos disponibles
- `sabores`: Sabor[] - Lista de sabores disponibles
- `tamanos`: Tamano[] - Lista de tamaños disponibles
- `filteredOptions`: { sabores: Sabor[], tamanos: Tamano[] } - Opciones filtradas
- Y callbacks para manejar interacciones

**Uso:**
```typescript
<ItemModal
  visible={showModal}
  editingItem={editing}
  tempItem={tempItem}
  productos={productos}
  sabores={sabores}
  tamanos={tamanos}
  filteredOptions={filteredOptions}
  onTempItemChange={setTempItem}
  onClose={() => setShowModal(false)}
  onSubmit={handleAddItem}
  // ... otros props
/>
```

### ItemsList
Componente para mostrar una lista de items del carrito con acciones de edición y eliminación.

**Props:**
- `items`: Omit<PedidoItem, 'id' | 'pedido_id'>[] - Items a mostrar
- `productos`: Producto[] - Lista de productos para mostrar nombres
- `sabores`: Sabor[] - Lista de sabores para mostrar nombres
- `onEditItem`: (index: number) => void - Callback para editar
- `onRemoveItem`: (index: number) => void - Callback para eliminar
- `onAddItem`: () => void - Callback para agregar nuevo item

**Uso:**
```typescript
<ItemsList
  items={items}
  productos={productos}
  sabores={sabores}
  onEditItem={handleEditItem}
  onRemoveItem={handleRemoveItem}
  onAddItem={handleAddItem}
/>
```

### OrderSummary
Componente para mostrar el resumen financiero del pedido incluyendo totales, abonos y descripción.

**Props:**
- `precioTotal`: number - Precio total del pedido
- `abonoInicial`: number - Monto del abono inicial
- `onAbonoChange`: (value: number) => void - Callback para cambiar abono
- `fechaEntrega`: string - Fecha de entrega
- `onFechaChange`: (date: string) => void - Callback para cambiar fecha
- `descripcion`: string - Descripción del pedido
- `onDescripcionChange`: (text: string) => void - Callback para cambiar descripción
- `descripcionHeight`: number - Altura del textarea

**Uso:**
```typescript
<OrderSummary
  precioTotal={precioTotal}
  abonoInicial={abonoInicial}
  onAbonoChange={setAbonoInicial}
  fechaEntrega={fechaEntrega}
  onFechaChange={setFechaEntrega}
  descripcion={descripcion}
  onDescripcionChange={setDescripcion}
  descripcionHeight={descripcionHeight}
/>
```

### ClienteSelector
Selector de clientes con modal de búsqueda y selección.

**Props:**
- `visible`: boolean - Visibilidad del modal
- `clientes`: Cliente[] - Lista de clientes disponibles
- `selectedClienteId`: string - ID del cliente seleccionado
- `onSelect`: (clienteId: string) => void - Callback al seleccionar
- `onClose`: () => void - Callback al cerrar

**Uso:**
```typescript
<ClienteSelector
  visible={showSelector}
  clientes={clientes}
  selectedClienteId={selectedId}
  onSelect={setSelectedCliente}
  onClose={() => setShowSelector(false)}
/>
```

## 🪝 Hooks

### usePedidoForm
Hook personalizado que maneja toda la lógica del formulario de pedidos incluyendo estado, validaciones y acciones.

**Retorna:**
- Estado del formulario (cliente, items, totales, etc.)
- Funciones para manipular el estado
- Funciones de validación
- Manejo de modales

**Uso:**
```typescript
const {
  clienteId,
  items,
  precioTotal,
  setClienteId,
  handleAddItem,
  handleEditItem,
  validateForm,
  // ... otras propiedades y funciones
} = usePedidoForm();
```

## 🔄 Integración

### Importación individual:
```typescript
import { ItemModal, ItemsList } from '../components/pedidos';
```

### Importación completa:
```typescript
import { 
  ItemModal, 
  ItemsList, 
  OrderSummary, 
  ClienteSelector,
  usePedidoForm 
} from '../components/pedidos';
```

## 🎨 Características

- **TypeScript**: Totalmente tipado
- **Reutilizable**: Puede usarse en cualquier pantalla
- **Responsive**: Se adapta a diferentes tamaños de pantalla
- **Accesible**: Incluye etiquetas y lectores de pantalla
- **Temable**: Usa las variables de colores y estilos globales

## 🛠️ Dependencias

- React Native hooks estándar
- Tipos de la aplicación (`types/index.ts`)
- Utilidades de formato y constantes
- Servicios de metadata para carga dinámica

## 📱 Ejemplos de Uso

### Pantalla de Crear Pedido:
```typescript
const CrearPedidoScreen = () => {
  const pedidoForm = usePedidoForm();
  
  return (
    <View>
      <ClienteSelector {...clienteSelectorProps} />
      <ItemsList {...itemsListProps} />
      <OrderSummary {...orderSummaryProps} />
      <ItemModal {...itemModalProps} />
    </View>
  );
};
```

### Pantalla de Editar Pedido:
```typescript
const EditarPedidoScreen = () => {
  const pedidoForm = usePedidoForm();
  
  // Cargar datos existentes...
  
  return (
    <View>
      <ItemsList items={existingItems} />
      <OrderSummary {...summaryProps} />
    </View>
  );
};
```

## 🚀 Próximos Mejoras

1. **Testing**: Agregar tests unitarios para cada componente
2. **Storybook**: Documentar componentes con Storybook
3. **Performance**: Optimizar renderizados con React.memo
4. **Internacionalización**: Soporte para múltiples idiomas
5. **Accesibilidad**: Mejorar soporte para lectores de pantalla
