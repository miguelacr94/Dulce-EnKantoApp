/**
 * Hook profesional para gestión de pedidos
 * Implementa React Query para estado del servidor
 * @module features/pedidos/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { pedidosRepository, PedidoRepositoryError } from '../api/pedidos.repository';
import { notificationService } from '@/app/core/notifications';
import type {
  Pedido,
  PedidoConDetalles,
  EstadoPedido,
  CrearPedidoDTO,
  ActualizarPedidoDTO,
  CrearPedidoItemDTO,
} from '../types/pedido.types';

// Re-exportar tipos para consumidores del hook
export type { EstadoPedido } from '../types/pedido.types';

// Query Keys para cache optimizado
export const PEDIDOS_QUERY_KEYS = {
  all: ['pedidos'] as const,
  lists: () => [...PEDIDOS_QUERY_KEYS.all, 'list'] as const,
  list: (filters: { estado?: EstadoPedido; clienteTelefono?: string }) =>
    [...PEDIDOS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...PEDIDOS_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PEDIDOS_QUERY_KEYS.details(), id] as const,
  estadisticas: () => [...PEDIDOS_QUERY_KEYS.all, 'estadisticas'] as const,
} as const;

// Stale times optimizados
const STALE_TIMES = {
  pedidos: 5 * 60 * 1000, // 5 minutos
  estadisticas: 2 * 60 * 1000, // 2 minutos
  detalle: 10 * 60 * 1000, // 10 minutos
};

interface UsePedidosReturn {
  // Data
  pedidos: PedidoConDetalles[];
  estadisticas: {
    pendientes: number;
    entregados: number;
    cancelados: number;
    totalPendienteCobrar: number;
  } | undefined;

  // Loading states
  isLoading: boolean;
  isLoadingEstadisticas: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isChangingEstado: boolean;

  // Errors
  error: Error | null;
  errorEstadisticas: Error | null;

  // Actions
  refetch: () => Promise<void>;
  createPedido: (
    pedido: CrearPedidoDTO,
    items: CrearPedidoItemDTO[]
  ) => Promise<Pedido>;
  updatePedido: (
    id: string,
    pedido: ActualizarPedidoDTO,
    items?: CrearPedidoItemDTO[]
  ) => Promise<Pedido>;
  deletePedido: (id: string) => Promise<void>;
  cambiarEstado: (id: string, estado: EstadoPedido) => Promise<Pedido>;
  getPedidoById: (id: string) => Promise<PedidoConDetalles | null>;
  getPedidosPorEstado: (estado: EstadoPedido) => Promise<PedidoConDetalles[]>;
}

/**
 * Hook principal para gestión de pedidos
 * @returns {UsePedidosReturn} Objeto con data, estados de carga y acciones
 */
export function usePedidos(): UsePedidosReturn {
  const queryClient = useQueryClient();

  // Query: Lista de pedidos
  const {
    data: pedidos = [],
    isLoading,
    error,
    refetch: refetchPedidos,
  } = useQuery({
    queryKey: PEDIDOS_QUERY_KEYS.lists(),
    queryFn: () => pedidosRepository.getAll(),
    staleTime: STALE_TIMES.pedidos,
    gcTime: 10 * 60 * 1000, // Garbage collection time
    retry: (failureCount, error) => {
      if (error instanceof PedidoRepositoryError) return false;
      return failureCount < 3;
    },
  });

  // Programar automáticamente las notificaciones cuando se cargan los pedidos
  useEffect(() => {
    if (pedidos.length > 0 && !isLoading) {
      notificationService.reschedulePedidosNotifications(pedidos).catch(console.error);
    }
  }, [pedidos, isLoading]);

  // Query: Estadísticas
  const {
    data: estadisticas,
    isLoading: isLoadingEstadisticas,
    error: errorEstadisticas,
  } = useQuery({
    queryKey: PEDIDOS_QUERY_KEYS.estadisticas(),
    queryFn: () => pedidosRepository.getEstadisticas(),
    staleTime: STALE_TIMES.estadisticas,
    gcTime: 5 * 60 * 1000,
  });

  // Mutation: Crear pedido
  const createMutation = useMutation({
    mutationFn: ({
      pedido,
      items,
    }: {
      pedido: CrearPedidoDTO;
      items: CrearPedidoItemDTO[];
    }) => pedidosRepository.create(pedido, items),
    onSuccess: async (result, variables) => {
      queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PEDIDOS_QUERY_KEYS.estadisticas(),
      });
      
      // Programar notificación para el nuevo pedido
      if (result.estado === 'pendiente' && result.fecha_entrega) {
        try {
          // Extraer hora de la fecha de entrega
          const fechaEntrega = new Date(result.fecha_entrega);
          const horaEntrega = fechaEntrega.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          // Extraer nombres de productos de los items
          const productos = variables.items?.map((item: any) => {
            // Intentar obtener nombre del producto, si no hay usar ID
            return item.producto_nombre || item.producto_id || 'Producto';
          }) || [];
          
          await notificationService.schedulePedidoNotification({
            pedidoId: result.id,
            clienteNombre: result.cliente_nombre,
            productos,
            horaEntrega,
            fechaEntrega: result.fecha_entrega,
          });
        } catch (error) {
          console.error('Error scheduling notification for new pedido:', error);
        }
      }
    },
    onError: (error) => {
      console.error('Error creating pedido:', error);
    },
  });

  // Mutation: Actualizar pedido
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      pedido,
      items,
    }: {
      id: string;
      pedido: ActualizarPedidoDTO;
      items?: CrearPedidoItemDTO[];
    }) => pedidosRepository.update(id, pedido, items),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PEDIDOS_QUERY_KEYS.estadisticas(),
      });
      
      // Reprogramar notificaciones después de actualizar
      setTimeout(() => {
        const currentPedidos = queryClient.getQueryData<PedidoConDetalles[]>(PEDIDOS_QUERY_KEYS.lists()) || [];
        notificationService.reschedulePedidosNotifications(currentPedidos).catch(console.error);
      }, 100);
    },
  });

  // Mutation: Cambiar estado
  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoPedido }) =>
      pedidosRepository.cambiarEstado(id, estado),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PEDIDOS_QUERY_KEYS.estadisticas(),
      });
      
      // Reprogramar notificaciones después de cambiar estado
      setTimeout(() => {
        const currentPedidos = queryClient.getQueryData<PedidoConDetalles[]>(PEDIDOS_QUERY_KEYS.lists()) || [];
        notificationService.reschedulePedidosNotifications(currentPedidos).catch(console.error);
      }, 100);
    },
  });

  // Mutation: Eliminar pedido
  const deleteMutation = useMutation({
    mutationFn: (id: string) => pedidosRepository.delete(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: PEDIDOS_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: PEDIDOS_QUERY_KEYS.estadisticas(),
      });
      
      // Reprogramar notificaciones después de eliminar
      setTimeout(() => {
        const currentPedidos = queryClient.getQueryData<PedidoConDetalles[]>(PEDIDOS_QUERY_KEYS.lists()) || [];
        notificationService.reschedulePedidosNotifications(currentPedidos).catch(console.error);
      }, 100);
    },
  });

  // Actions expuestas
  const createPedido = async (
    pedido: CrearPedidoDTO,
    items: CrearPedidoItemDTO[]
  ): Promise<Pedido> => {
    return createMutation.mutateAsync({ pedido, items });
  };

  const updatePedido = async (
    id: string,
    pedido: ActualizarPedidoDTO,
    items?: CrearPedidoItemDTO[]
  ): Promise<Pedido> => {
    return updateMutation.mutateAsync({ id, pedido, items });
  };

  const deletePedido = async (id: string): Promise<void> => {
    return deleteMutation.mutateAsync(id);
  };

  const cambiarEstado = async (
    id: string,
    estado: EstadoPedido
  ): Promise<Pedido> => {
    return cambiarEstadoMutation.mutateAsync({ id, estado });
  };

  const getPedidoById = async (id: string): Promise<PedidoConDetalles | null> => {
    try {
      // Primero buscar en cache
      const cached = queryClient.getQueryData<PedidoConDetalles>(
        PEDIDOS_QUERY_KEYS.detail(id)
      );
      if (cached) return cached;

      // Si no está en cache, buscar en la lista cargada
      const cachedList = queryClient.getQueryData<PedidoConDetalles[]>(
        PEDIDOS_QUERY_KEYS.lists()
      );
      const fromList = cachedList?.find((p) => p.id === id);
      if (fromList) return fromList;

      // Si no está en ningún lado, fetch desde API
      return await pedidosRepository.getById(id);
    } catch (error) {
      console.error('Error getting pedido by id:', error);
      return null;
    }
  };

  const getPedidosPorEstado = async (
    estado: EstadoPedido
  ): Promise<PedidoConDetalles[]> => {
    try {
      // Buscar en cache primero
      const cached = queryClient.getQueryData<PedidoConDetalles[]>(
        PEDIDOS_QUERY_KEYS.list({ estado })
      );
      if (cached) return cached;

      return await pedidosRepository.getByEstado(estado);
    } catch (error) {
      console.error('Error getting pedidos por estado:', error);
      return [];
    }
  };

  const refetch = async (): Promise<void> => {
    await refetchPedidos();
  };

  return {
    // Data
    pedidos,
    estadisticas,

    // Loading states
    isLoading,
    isLoadingEstadisticas,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isChangingEstado: cambiarEstadoMutation.isPending,

    // Errors
    error,
    errorEstadisticas,

    // Actions
    refetch,
    createPedido,
    updatePedido,
    deletePedido,
    cambiarEstado,
    getPedidoById,
    getPedidosPorEstado,
  };
}

/**
 * Hook para obtener un pedido específico por ID
 * Con cache y stale time optimizados
 */
export function usePedido(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: PEDIDOS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      // Intentar obtener de la lista cacheada primero
      const cachedList = queryClient.getQueryData<PedidoConDetalles[]>(
        PEDIDOS_QUERY_KEYS.lists()
      );
      const fromList = cachedList?.find((p) => p.id === id);
      if (fromList) return fromList;

      const result = await pedidosRepository.getById(id);
      if (!result) throw new Error('Pedido no encontrado');
      return result;
    },
    staleTime: STALE_TIMES.detalle,
    gcTime: 15 * 60 * 1000,
    enabled: !!id,
  });
}
