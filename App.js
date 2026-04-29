import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './src/providers/QueryProvider';
import AppNavigator from './src/app/navigation/AppNavigator';
import { notificationService } from '@/app/core/notifications';
import { useNotificationHandler } from '@/hooks/use-notification-handler.hook';

function AppContent() {
  // Ahora useNotificationHandler está DENTRO de NavigationContainer en App()
  useNotificationHandler();

  useEffect(() => {
    // Inicializar el servicio de notificaciones al iniciar la app
    notificationService.initialize().catch(console.error);
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
