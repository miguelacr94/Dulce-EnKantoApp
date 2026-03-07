import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { logger } from '../logging';
import { AppError } from '../errors';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PedidoNotificationData {
  pedidoId: string;
  clienteNombre: string;
  productos: string[];
  horaEntrega: string;
  fechaEntrega: string;
}

class NotificationService {
  private initialized = false;

  /**
   * Inicializa el servicio de notificaciones y solicita permisos
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Solicitar permisos para notificaciones
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        logger.warn('Permisos de notificación no concedidos');
        return;
      }

      // Configurar canal de notificación para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('pedidos-urgentes', {
          name: 'Pedidos Urgentes',
          description: 'Notificaciones sobre pedidos próximos a entregar',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: 'default',
          enableLights: true,
          lightColor: '#FF69B4',
          enableVibrate: true,
        });
      }

      this.initialized = true;
      logger.info('Servicio de notificaciones inicializado');
    } catch (error) {
      logger.error('Error inicializando notificaciones', error as Error);
      throw new AppError('Error inicializando notificaciones', 'NOTIFICATION_INIT_ERROR');
    }
  }

  /**
   * Programa una notificación para un pedido 3 horas antes de la entrega
   */
  async schedulePedidoNotification(pedido: PedidoNotificationData): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Calcular fecha de notificación (3 horas antes de entrega)
      const fechaEntrega = new Date(pedido.fechaEntrega);
      const [hora, minuto] = pedido.horaEntrega.split(':');
      
      // Configurar fecha y hora de entrega
      fechaEntrega.setHours(parseInt(hora), parseInt(minuto), 0, 0);
      
      // Restar 3 horas para la notificación
      const fechaNotificacion = new Date(fechaEntrega.getTime() - 3 * 60 * 60 * 1000);
      
      // Verificar que la notificación sea en el futuro
      if (fechaNotificacion <= new Date()) {
        logger.warn(`Fecha de notificación pasada para pedido ${pedido.pedidoId}`);
        return null;
      }

      // Construir mensaje de productos
      const productosTexto = pedido.productos.length > 0 
        ? pedido.productos.slice(0, 3).join(', ') + (pedido.productos.length > 3 ? '...' : '')
        : 'Varios productos';

      // Programar notificación
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🍰 Pedido Próximo: ${pedido.clienteNombre}`,
          body: `Entrega a las ${pedido.horaEntrega} | ${productosTexto}`,
          data: {
            pedidoId: pedido.pedidoId,
            type: 'pedido-proximo',
            clienteNombre: pedido.clienteNombre,
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fechaNotificacion,
        },
      });

      logger.info(`Notificación programada para pedido ${pedido.pedidoId} - ${fechaNotificacion.toISOString()}`);
      return identifier;
    } catch (error) {
      logger.error('Error programando notificación de pedido', error as Error);
      throw new AppError('Error programando notificación', 'NOTIFICATION_SCHEDULE_ERROR');
    }
  }

  /**
   * Cancela una notificación programada
   */
  async cancelNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      logger.info(`Notificación cancelada: ${identifier}`);
    } catch (error) {
      logger.error('Error cancelando notificación', error as Error);
    }
  }

  /**
   * Cancela todas las notificaciones programadas
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      logger.info('Todas las notificaciones canceladas');
    } catch (error) {
      logger.error('Error cancelando todas las notificaciones', error as Error);
    }
  }

  /**
   * Obtiene todas las notificaciones programadas
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      logger.error('Error obteniendo notificaciones programadas', error as Error);
      return [];
    }
  }

  /**
   * Reprograma todas las notificaciones para pedidos pendientes
   */
  async reschedulePedidosNotifications(pedidos: any[]): Promise<void> {
    // Cancelar notificaciones existentes
    await this.cancelAllNotifications();

    // Programar nuevas notificaciones
    for (const pedido of pedidos) {
      if (pedido.estado === 'pendiente' && pedido.fecha_entrega && pedido.hora_entrega) {
        try {
          // Extraer productos del pedido
          const productos = pedido.pedido_items?.map((item: any) => 
            item.productos?.nombre || item.producto_nombre || 'Producto'
          ) || [];

          await this.schedulePedidoNotification({
            pedidoId: pedido.id,
            clienteNombre: pedido.cliente_nombre || 'Cliente',
            productos,
            horaEntrega: pedido.hora_entrega,
            fechaEntrega: pedido.fecha_entrega,
          });
        } catch (error) {
          logger.error(`Error programando notificación para pedido ${pedido.id}`, error as Error);
        }
      }
    }
  }

  /**
   * Envía una notificación inmediata de prueba
   */
  async sendTestNotification(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Notificación de Prueba',
        body: 'Sistema de notificaciones funcionando correctamente',
        data: { type: 'test' },
      },
      trigger: null, // Inmediata
    });
  }
  
  /**
   * Actualiza el badge del icono de la app
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === 'granted') {
          await Notifications.setBadgeCountAsync(count);
          logger.info(`Badge actualizado a ${count}`);
        }
      }
    } catch (error) {
      logger.error('Error actualizando badge', error as Error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
