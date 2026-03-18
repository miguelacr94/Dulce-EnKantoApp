import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from '@/app/navigation/AppNavigator';

type AppNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  StackNavigationProp<RootStackParamList>
>;

export const useNotificationHandler = () => {
  const navigation = useNavigation<AppNavigationProp>();

  useEffect(() => {
    // Manejar notificaciones cuando la app está en primer plano
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { data } = response.notification.request.content;
        
        // Si es una notificación de recordatorio de pedido
        if (data?.type === 'pedido-reminder' && data?.pedidoId && typeof data.pedidoId === 'string') {
          // Navegar al detalle del pedido
          navigation.navigate('PedidoDetalle', { pedidoId: data.pedidoId });
        }
      }
    );

    // Manejar notificaciones cuando la app se abre desde una notificación
    const handleInitialNotification = async () => {
      try {
        const response = await Notifications.getLastNotificationResponseAsync();
        
        if (response?.notification.request.content.data?.type === 'pedido-reminder') {
          const pedidoId = response.notification.request.content.data.pedidoId;
          if (pedidoId && typeof pedidoId === 'string') {
            navigation.navigate('PedidoDetalle', { pedidoId });
          }
        }
      } catch (error) {
        console.error('Error handling initial notification:', error);
      }
    };

    // Verificar si la app se abrió desde una notificación
    handleInitialNotification();

    return () => {
      subscription.remove();
    };
  }, [navigation]);
};
