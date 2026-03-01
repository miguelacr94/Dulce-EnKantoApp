/**
 * Feature: Productos
 * @module features/productos
 */

export type {
  Producto,
  Sabor,
  Tamano,
  TipoProducto,
  TipoMedida,
  TipoTamano,
  CrearProductoDTO,
  ActualizarProductoDTO,
  CrearSaborDTO,
  CrearTamanoDTO,
} from './types/producto.types';

export {
  ProductosRepository,
  productosRepository,
  ProductoRepositoryError,
  type IProductosRepository,
} from './api/productos.repository';

export {
  useProductos,
  useProducto,
  useSabores,
  useTamanos,
  useSaboresPorProducto,
  useTamanosPorProducto,
  useSaborMutations,
  useTamanoMutations,
  PRODUCTOS_QUERY_KEYS,
} from './hooks/use-productos.hook';

export { useMetadata } from './hooks/useMetadata';
