/**
 * Hook profesional para gestión de productos, sabores y tamaños
 * @module features/productos/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  productosRepository,
  ProductoRepositoryError,
} from '../api/productos.repository';
import type {
  Producto,
  Sabor,
  Tamano,
  CrearProductoDTO,
  ActualizarProductoDTO,
  CrearSaborDTO,
  CrearTamanoDTO,
} from '../types/producto.types';

export const PRODUCTOS_QUERY_KEYS = {
  all: ['productos'] as const,
  lists: () => [...PRODUCTOS_QUERY_KEYS.all, 'list'] as const,
  details: () => [...PRODUCTOS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCTOS_QUERY_KEYS.details(), id] as const,
  sabores: () => [...PRODUCTOS_QUERY_KEYS.all, 'sabores'] as const,
  tamanos: () => [...PRODUCTOS_QUERY_KEYS.all, 'tamanos'] as const,
  saboresPorProducto: (id: string) =>
    [...PRODUCTOS_QUERY_KEYS.detail(id), 'sabores'] as const,
  tamanosPorProducto: (id: string) =>
    [...PRODUCTOS_QUERY_KEYS.detail(id), 'tamanos'] as const,
} as const;

const STALE_TIMES = {
  productos: 10 * 60 * 1000,
  catalogos: 30 * 60 * 1000,
  relaciones: 5 * 60 * 1000,
};

interface UseProductosReturn {
  productos: Producto[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createProducto: (producto: CrearProductoDTO) => Promise<Producto>;
  updateProducto: (id: string, producto: ActualizarProductoDTO) => Promise<Producto>;
  deleteProducto: (id: string) => Promise<void>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export function useProductos(): UseProductosReturn {
  const queryClient = useQueryClient();

  const {
    data: productos = [],
    isLoading,
    error,
    refetch: refetchProductos,
  } = useQuery({
    queryKey: PRODUCTOS_QUERY_KEYS.lists(),
    queryFn: () => productosRepository.getAll(),
    staleTime: STALE_TIMES.productos,
    gcTime: 20 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (producto: CrearProductoDTO) =>
      productosRepository.create(producto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.lists() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, producto }: { id: string; producto: ActualizarProductoDTO }) =>
      productosRepository.update(id, producto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: PRODUCTOS_QUERY_KEYS.detail(variables.id),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productosRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.lists() });
    },
  });

  const createProducto = async (producto: CrearProductoDTO): Promise<Producto> => {
    return createMutation.mutateAsync(producto);
  };

  const updateProducto = async (
    id: string,
    producto: ActualizarProductoDTO
  ): Promise<Producto> => {
    return updateMutation.mutateAsync({ id, producto });
  };

  const deleteProducto = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const refetch = async (): Promise<void> => {
    await refetchProductos();
  };

  return {
    productos,
    isLoading,
    error,
    refetch,
    createProducto,
    updateProducto,
    deleteProducto,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useProducto(id: string) {
  return useQuery({
    queryKey: PRODUCTOS_QUERY_KEYS.detail(id),
    queryFn: () => productosRepository.getById(id),
    staleTime: STALE_TIMES.productos,
    enabled: !!id,
  });
}

export function useSabores() {
  return useQuery({
    queryKey: PRODUCTOS_QUERY_KEYS.sabores(),
    queryFn: () => productosRepository.getSabores(),
    staleTime: STALE_TIMES.catalogos,
    gcTime: 60 * 60 * 1000,
  });
}

export function useTamanos() {
  return useQuery({
    queryKey: PRODUCTOS_QUERY_KEYS.tamanos(),
    queryFn: () => productosRepository.getTamanos(),
    staleTime: STALE_TIMES.catalogos,
    gcTime: 60 * 60 * 1000,
  });
}

export function useSaboresPorProducto(productoId: string) {
  return useQuery({
    queryKey: PRODUCTOS_QUERY_KEYS.saboresPorProducto(productoId),
    queryFn: () => productosRepository.getSaboresPorProducto(productoId),
    staleTime: STALE_TIMES.relaciones,
    enabled: !!productoId,
  });
}

export function useTamanosPorProducto(productoId: string) {
  return useQuery({
    queryKey: PRODUCTOS_QUERY_KEYS.tamanosPorProducto(productoId),
    queryFn: () => productosRepository.getTamanosPorProducto(productoId),
    staleTime: STALE_TIMES.relaciones,
    enabled: !!productoId,
  });
}

export function useSaborMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (sabor: CrearSaborDTO) => productosRepository.createSabor(sabor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.sabores() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, sabor }: { id: string; sabor: Partial<Sabor> }) =>
      productosRepository.updateSabor(id, sabor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.sabores() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productosRepository.deleteSabor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.sabores() });
    },
  });

  return {
    createSabor: createMutation.mutateAsync,
    updateSabor: (id: string, sabor: Partial<Sabor>) =>
      updateMutation.mutateAsync({ id, sabor }),
    deleteSabor: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTamanoMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (tamano: CrearTamanoDTO) => productosRepository.createTamano(tamano),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.tamanos() });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, tamano }: { id: string; tamano: Partial<Tamano> }) =>
      productosRepository.updateTamano(id, tamano),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.tamanos() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productosRepository.deleteTamano(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTOS_QUERY_KEYS.tamanos() });
    },
  });

  return {
    createTamano: createMutation.mutateAsync,
    updateTamano: (id: string, tamano: Partial<Tamano>) =>
      updateMutation.mutateAsync({ id, tamano }),
    deleteTamano: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
