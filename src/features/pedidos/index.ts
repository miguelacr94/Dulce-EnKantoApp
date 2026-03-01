/**
 * Feature: Pedidos
 * Barrel export para la feature de gestión de pedidos
 * @module features/pedidos
 */

// Types
export type {
  Pedido,
  PedidoConDetalles,
  PedidoItem,
  Abono,
  Producto,
  Sabor,
  Tamano,
  EstadoPedido,
  CrearPedidoDTO,
  ActualizarPedidoDTO,
  CrearPedidoItemDTO,
  EstadisticasPedidos,
} from './types/pedido.types';

// API / Repository
export {
  PedidosRepository,
  pedidosRepository,
  PedidoRepositoryError,
  type IPedidosRepository,
} from './api/pedidos.repository';

// Hooks
export {
  usePedidos,
  usePedido,
  PEDIDOS_QUERY_KEYS,
} from './hooks/use-pedidos.hook';

// Screens
export { default as DashboardScreen } from './screens/DashboardScreen';
export { default as PedidosScreen } from './screens/PedidosScreen';
