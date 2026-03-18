import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

// Importar pantallas desde features (Arquitectura SOLID)
import { DashboardScreen, PedidosScreen, CrearPedidoScreen, PedidoDetalleScreen, EditarPedidoScreen, AddItemScreen } from '@/features/pedidos/screens';
import { CrearPedidoItemDTO } from '@/features/pedidos/types';


import { ConfiguracionScreen } from '@/features/configuracion/screens';

import { GestionProductosScreen, GestionSaboresScreen, GestionTamanosScreen } from '@/features/productos/screens';

// Tipos de navegación
export type RootStackParamList = {
  MainTabs: undefined;
  PedidoDetalle: { pedidoId: string };
  CrearPedido: { newItem?: CrearPedidoItemDTO; editingIndex?: number } | undefined;
  EditarPedido: { pedidoId: string; newItem?: CrearPedidoItemDTO; editingIndex?: number };
  Configuracion: undefined;
  GestionProductos: undefined;
  GestionSabores: undefined;
  GestionTamanos: undefined;
  AddItem: { initialItem?: CrearPedidoItemDTO; editingIndex?: number; returnTo: 'CrearPedido' | 'EditarPedido'; pedidoId?: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Pedidos: undefined;
  Configuracion: undefined;
};

// Combinar ambos tipos para navegación completa
export type NavigationParamList = RootStackParamList & TabParamList;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Componentes de iconos para las tabs
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🏠</Text>
);

const PedidosIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>📋</Text>
);

const ConfigIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>⚙️</Text>
);

// Componente para las tabs principales
const MainTabs = () => {
  return (
    <Tab.Navigator
      id="main-tabs"
      screenOptions={{
        tabBarActiveTintColor: '#FF69B4', // Rosa pastel
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFF5F5', // Rosa muy claro
          borderTopColor: '#FFB6C1', // Rosa claro
        },
        headerStyle: {
          backgroundColor: '#FFB6C1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: PedidosIcon,
        }}
      />
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{
          tabBarLabel: 'Config',
          tabBarIcon: ConfigIcon,
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  return (
    <Stack.Navigator
      id="root-stack"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFB6C1',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PedidoDetalle"
        component={PedidoDetalleScreen}
        options={{ title: 'Detalle del Pedido' }}
      />
      <Stack.Screen
        name="CrearPedido"
        component={CrearPedidoScreen}
        options={{ title: 'Crear Pedido' }}
      />
      <Stack.Screen
        name="EditarPedido"
        component={EditarPedidoScreen}
        options={{ title: 'Editar Pedido' }}
      />
      <Stack.Screen
        name="GestionProductos"
        component={GestionProductosScreen}
        options={{ title: 'Gestionar Productos' }}
      />
      <Stack.Screen
        name="GestionSabores"
        component={GestionSaboresScreen}
        options={{ title: 'Gestionar Sabores' }}
      />
      <Stack.Screen
        name="GestionTamanos"
        component={GestionTamanosScreen}
        options={{ title: 'Gestionar Tamaños' }}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ title: 'Agregar Item' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
