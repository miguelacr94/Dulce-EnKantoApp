import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas
import DashboardScreen from '../screens/DashboardScreen';
import ClientesScreen from '../screens/ClientesScreen';
import PedidosScreen from '../screens/PedidosScreen';
import CrearPedidoScreen from '../screens/CrearPedidoScreen';
import PedidoDetalleScreen from '../screens/PedidoDetalleScreen';
import EditarPedidoScreen from '../screens/EditarPedidoScreen';
import ClienteDetalleScreen from '../screens/ClienteDetalleScreen';
import CrearClienteScreen from '../screens/CrearClienteScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import GestionProductosScreen from '../screens/GestionProductosScreen';
import GestionSaboresScreen from '../screens/GestionSaboresScreen';
import GestionTamanosScreen from '../screens/GestionTamanosScreen';

// Tipos de navegación
export type RootStackParamList = {
  MainTabs: undefined;
  PedidoDetalle: { pedidoId: string };
  CrearPedido: undefined;
  EditarPedido: { pedidoId: string };
  ClienteDetalle: { clienteId: string };
  CrearCliente: undefined;
  Configuracion: undefined;
  GestionProductos: undefined;
  GestionSabores: undefined;
  GestionTamanos: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Pedidos: undefined;
  Clientes: undefined;
  Configuracion: undefined;
};

// Combinar ambos tipos para navegación completa
export type NavigationParamList = RootStackParamList & TabParamList;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

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
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Clientes"
        component={ClientesScreen}
        options={{
          tabBarLabel: 'Clientes',
          tabBarIcon: () => null,
        }}
      />
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{
          tabBarLabel: 'Config',
          tabBarIcon: () => null,
          title: 'Configuracion',
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal
const AppNavigator = () => {
  return (
    <NavigationContainer>
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
          name="ClienteDetalle"
          component={ClienteDetalleScreen}
          options={{ title: 'Detalle del Cliente' }}
        />
        <Stack.Screen
          name="CrearCliente"
          component={CrearClienteScreen}
          options={{ title: 'Crear Cliente' }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
