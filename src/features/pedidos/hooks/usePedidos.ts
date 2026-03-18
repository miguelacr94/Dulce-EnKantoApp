import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosService } from '@/services';
import { useAppStore } from '@/app/store/appStore';
import { useEffect } from 'react';
import { Pedido, PedidoConDetalles, EstadoPedido, PedidoItem } from '@/features/pedidos/types';
import { notificationService } from '@/app/core/notifications';
import { notificationService as pedidoNotificationService } from '@/services/notifications.service';

export const usePedidos = () => {
  const queryClient = useQueryClient();
  const { setError } = useAppStore();

  // Query para obtener todos los pedidos
  const {
    data: pedidos = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['pedidos'],
    queryFn: pedidosService.getPedidos
  });

  // Query para obtener estadísticas
  const {
    data: estadisticas,
    isLoading: isLoadingEstadisticas,
    error: errorEstadisticas
  } = useQuery({
    queryKey: ['estadisticas'],
    queryFn: pedidosService.getEstadisticas
  });
  
  // Actualizar badge del icono de la app cuando cambian las estadísticas
  useEffect(() => {
    if (estadisticas?.pendientes !== undefined) {
      notificationService.setBadgeCount(estadisticas.pendientes);
    }
  }, [estadisticas?.pendientes]);

  // Mutation para crear pedido
  const createPedidoMutation = useMutation({
    mutationFn: ({ pedido, items }: { 
      pedido: Omit<Pedido, 'id' | 'created_at' | 'estado'>; 
      items: Omit<PedidoItem, 'id' | 'pedido_id'>[];
    }) => pedidosService.createPedido(pedido, items),
    onSuccess: async (data) => {
      // Refrescamos los pedidos para obtener los datos completos
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setError(null);
      
      // Programar notificación para el nuevo pedido
      if (data && data.estado === 'pendiente') {
        await pedidoNotificationService.schedulePedidoReminder(data);
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al crear pedido');
    }
  });

  // Mutation para actualizar pedido
  const updatePedidoMutation = useMutation({
    mutationFn: ({ id, pedido, items }: { 
      id: string; 
      pedido: Partial<Pedido>; 
      items?: Omit<PedidoItem, 'id' | 'pedido_id'>[];
    }) => pedidosService.updatePedido(id, pedido, items),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      setError(null);
      
      // Manejar notificaciones para el pedido actualizado
      if (data) {
        await pedidoNotificationService.cancelPedidoReminder(data.id);
        if (data.estado === 'pendiente') {
          await pedidoNotificationService.schedulePedidoReminder(data);
        }
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al actualizar pedido');
    }
  });

  // Mutation para cambiar estado
  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoPedido }) =>
      pedidosService.cambiarEstado(id, estado),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      setError(null);
      
      // Manejar notificaciones al cambiar estado
      if (data) {
        await pedidoNotificationService.cancelPedidoReminder(data.id);
        if (data.estado === 'pendiente') {
          await pedidoNotificationService.schedulePedidoReminder(data);
        }
      }
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al cambiar estado');
    }
  });

  // Mutation para eliminar pedido
  const deletePedidoMutation = useMutation({
    mutationFn: (id: string) => pedidosService.deletePedido(id),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['estadisticas'] });
      setError(null);
      
      // Cancelar notificación del pedido eliminado
      await pedidoNotificationService.cancelPedidoReminder(variables);
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Error al eliminar pedido');
    }
  });

  // Programar notificaciones para todos los pedidos pendientes
  const scheduleAllPendingReminders = async () => {
    const pendingPedidos = pedidos.filter(pedido => pedido.estado === 'pendiente');
    
    for (const pedido of pendingPedidos) {
      await pedidoNotificationService.schedulePedidoReminder(pedido);
    }
  };

  // Inicializar notificaciones cuando se cargan los pedidos
  useEffect(() => {
    if (pedidos.length > 0) {
      scheduleAllPendingReminders();
    }
  }, [pedidos.length]); // Solo cuando cambia la cantidad de pedidos

  // Funciones helper
  const createPedido = (
    pedido: Omit<Pedido, 'id' | 'created_at' | 'estado'>,
    items: Omit<PedidoItem, 'id' | 'pedido_id'>[] = []
  ) => {
    return createPedidoMutation.mutateAsync({ pedido, items });
  };

  const updatePedidoById = (id: string, pedido: Partial<Pedido>, items?: Omit<PedidoItem, 'id' | 'pedido_id'>[]) => {
    return updatePedidoMutation.mutateAsync({ id, pedido, items });
  };

  const cambiarEstadoPedido = (id: string, estado: EstadoPedido) => {
    return cambiarEstadoMutation.mutateAsync({ id, estado });
  };

  const deletePedidoById = (id: string) => {
    return deletePedidoMutation.mutateAsync(id);
  };

  const getPedidoById = async (id: string): Promise<PedidoConDetalles | null> => {
    try {
      const pedido = await pedidosService.getPedidoById(id);
      return pedido;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al obtener pedido');
      return null;
    }
  };

  const getPedidosPorEstado = async (estado: EstadoPedido): Promise<PedidoConDetalles[]> => {
    try {
      return await pedidosService.getPedidosPorEstado(estado);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al obtener pedidos por estado');
      return [];
    }
  };

  return {
    pedidos,
    estadisticas,
    isLoading,
    isLoadingEstadisticas,
    error,
    errorEstadisticas,
    refetch,
    createPedido,
    updatePedido: updatePedidoById,
    cambiarEstado: cambiarEstadoPedido,
    deletePedido: deletePedidoById,
    getPedidoById,
    getPedidosPorEstado,
    scheduleAllPendingReminders,
    isCreating: createPedidoMutation.isPending,
    isUpdating: updatePedidoMutation.isPending,
    isChangingEstado: cambiarEstadoMutation.isPending,
    isDeleting: deletePedidoMutation.isPending
  };
};
