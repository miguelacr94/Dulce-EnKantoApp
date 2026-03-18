import { useEffect } from 'react';
import { useNotificationService } from '@/services/notifications.service';
import { usePedidos } from '@/features/pedidos';
import { Pedido } from '@/features/pedidos/types';

export const usePedidoNotifications = () => {
  const { scheduleReminder, cancelReminder, requestPermissions } = useNotificationService();
  const { pedidos } = usePedidos();

  // Inicializar permisos al montar el hook
  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // Programar notificaciones para todos los pedidos pendientes
  const scheduleAllPendingReminders = async () => {
    const pendingPedidos = pedidos.filter(pedido => pedido.estado === 'pendiente');
    
    for (const pedido of pendingPedidos) {
      await scheduleReminder(pedido);
    }
  };

  // Programar notificación para un pedido específico
  const schedulePedidoReminder = async (pedido: Pedido) => {
    await scheduleReminder(pedido);
  };

  // Cancelar notificación de un pedido específico
  const cancelPedidoReminder = async (pedidoId: string) => {
    await cancelReminder(pedidoId);
  };

  // Manejar cambio de estado de pedido
  const handlePedidoEstadoChange = async (pedido: Pedido) => {
    // Cancelar notificación existente
    await cancelReminder(pedido.id);
    
    // Si el nuevo estado es pendiente, programar nueva notificación
    if (pedido.estado === 'pendiente') {
      await scheduleReminder(pedido);
    }
  };

  return {
    scheduleAllPendingReminders,
    schedulePedidoReminder,
    cancelPedidoReminder,
    handlePedidoEstadoChange,
  };
};
