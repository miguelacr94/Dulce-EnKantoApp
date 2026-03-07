import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { QueryProvider } from './src/providers/QueryProvider';
import AppNavigator from './src/app/navigation/AppNavigator';
import { notificationService } from '@/app/core/notifications';

export default function App() {
  useEffect(() => {
    // Inicializar el servicio de notificaciones al iniciar la app
    notificationService.initialize().catch(console.error);
  }, []);

  return (
    <QueryProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </QueryProvider>
  );
}
