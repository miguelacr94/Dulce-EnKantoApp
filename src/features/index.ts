/**
 * Features Barrel Export
 * Arquitectura SOLID - Importar desde features específicas para evitar colisiones
 * @module features
 *
 * @example
 * // ✅ Correcto - Importar desde feature específica
 * import { usePedidos, type Pedido } from '@/features/pedidos';
 * import { useProductos, type Producto } from '@/features/productos';
 */

// Re-exportar repositories (no hay colisiones)
export { pedidosRepository, PedidosRepository, PedidoRepositoryError } from './pedidos';
export { productosRepository, ProductosRepository, ProductoRepositoryError } from './productos';
