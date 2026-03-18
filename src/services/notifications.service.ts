import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Pedido } from '@/features/pedidos/types';

// Configurar el manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Identificador único para las notificaciones de pedidos
const PEDIDO_NOTIFICATION_PREFIX = 'pedido-reminder-';

export interface NotificationScheduler {
  schedulePedidoReminder: (pedido: Pedido) => Promise<void>;
  cancelPedidoReminder: (pedidoId: string) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

class NotificationService implements NotificationScheduler {
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        await Notifications.requestPermissionsAsync();
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        return newStatus === 'granted';
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async schedulePedidoReminder(pedido: Pedido): Promise<void> {
    try {
      // Solo programar para pedidos pendientes
      if (pedido.estado !== 'pendiente') {
        return;
      }

      // Cancelar notificación existente para este pedido
      await this.cancelPedidoReminder(pedido.id);

      const fechaEntrega = new Date(pedido.fecha_entrega);
      const ahora = new Date();
      
      // Calcular fecha para notificación (3 horas antes de entrega)
      const fechaNotificacion = new Date(fechaEntrega.getTime() - 3 * 60 * 60 * 1000);
      
      // Solo programar si la notificación es en el futuro
      if (fechaNotificacion <= ahora) {
        console.log(`La notificación para el pedido ${pedido.id} ya pasó o es muy pronto`);
        return;
      }

      // Programar la notificación
      await Notifications.scheduleNotificationAsync({
        identifier: `${PEDIDO_NOTIFICATION_PREFIX}${pedido.id}`,
        content: {
          title: '🎂 Recordatorio de Pedido',
          body: `El pedido de ${pedido.cliente_nombre} (${pedido.sabor}) se entrega en 3 horas`,
          data: {
            pedidoId: pedido.id,
            type: 'pedido-reminder',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fechaNotificacion,
        },
      });

      console.log(`Notificación programada para el pedido ${pedido.id} a las ${fechaNotificacion.toLocaleString()}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async cancelPedidoReminder(pedidoId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        `${PEDIDO_NOTIFICATION_PREFIX}${pedidoId}`
      );
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async cancelAllPedidoReminders(): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.identifier?.startsWith(PEDIDO_NOTIFICATION_PREFIX)) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  async getScheduledPedidoReminders(): Promise<string[]> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      return scheduledNotifications
        .filter(notification => 
          notification.identifier?.startsWith(PEDIDO_NOTIFICATION_PREFIX)
        )
        .map(notification => 
          notification.identifier?.replace(PEDIDO_NOTIFICATION_PREFIX, '') || ''
        )
        .filter(id => id !== '');
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}

// Exportar instancia única
export const notificationService = new NotificationService();

// Hook para manejar notificaciones en componentes
export const useNotificationService = () => {
  const scheduleReminder = async (pedido: Pedido) => {
    const hasPermission = await notificationService.requestPermissions();
    if (hasPermission) {
      await notificationService.schedulePedidoReminder(pedido);
    } else {
      console.warn('No se tienen permisos para enviar notificaciones');
    }
  };

  const cancelReminder = async (pedidoId: string) => {
    await notificationService.cancelPedidoReminder(pedidoId);
  };

  return {
    scheduleReminder,
    cancelReminder,
    requestPermissions: notificationService.requestPermissions,
  };
};
