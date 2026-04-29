import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';

// Importar pantallas desde features (Arquitectura SOLID)
import { DashboardScreen, PedidosScreen, CrearPedidoScreen, PedidoDetalleScreen, EditarPedidoScreen, AddItemScreen } from '@/features/pedidos/screens';
import { CrearPedidoItemDTO } from '@/features/pedidos/types';
import { GastosScreen, CrearGastoScreen, EditarGastoScreen } from '@/features/gastos/screens';


import { ConfiguracionScreen } from '@/features/configuracion/screens';

import { GestionProductosScreen, GestionSaboresScreen, GestionTamanosScreen } from '@/features/productos/screens';
import { GestionInsumosScreen, CrearInsumoScreen, EditarStockScreen } from '@/features/insumos';
import SplashScreen from '@/shared/screens/SplashScreen';

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
  GestionInsumos: undefined;
  CrearInsumo: { editingInsumo?: any };
  EditarStock: { insumo: import('@/features/insumos/types').Insumo };
  AddItem: { initialItem?: CrearPedidoItemDTO; editingIndex?: number; returnTo: 'CrearPedido' | 'EditarPedido'; pedidoId?: string };
  CrearGasto: undefined;
  EditarGasto: { gastoId: string };
  Splash: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Pedidos: undefined;
  Gastos: undefined;
  Configuracion: undefined;
};

// Combinar ambos tipos para navegación completa
export type NavigationParamList = RootStackParamList & TabParamList;

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

import { COLORS, SHADOWS, FONTS, BORDER_RADIUS } from '@/utils/constants';

// Componentes de iconos para las tabs
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>🏠</Text>
);

const PedidosIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>📋</Text>
);

const GastosIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>📉</Text>
);

const ConfigIcon = ({ color, size }: { color: string; size: number }) => (
  <Text style={{ color, fontSize: size }}>⚙️</Text>
);

import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Componente para las tabs principales
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      id="main-tabs"
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontWeight: '800',
          fontSize: 11,
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          height: 75 + insets.bottom,
          paddingTop: 12,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          ...SHADOWS.medium,
        },
        headerStyle: {
          backgroundColor: COLORS.primary, // Header Rosa
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: '#FFFFFF', // Texto Blanco
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 8,
          marginVertical: 4,
          height: 44,
        },
        tabBarActiveBackgroundColor: 'transparent',
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, color: focused ? COLORS.primary : COLORS.textMuted }}>🏠</Text>
          ),
          headerShown: false, // El Dashboard maneja su propio header rosa con SafeArea
        }}
      />
      <Tab.Screen
        name="Pedidos"
        component={PedidosScreen}
        options={{
          tabBarLabel: 'Ventas',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, color: focused ? COLORS.primary : COLORS.textMuted }}>📋</Text>
          ),
          title: 'Ventas',
        }}
      />
      <Tab.Screen
        name="Gastos"
        component={GastosScreen}
        options={{
          tabBarLabel: 'Gastos',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, color: focused ? COLORS.primary : COLORS.textMuted }}>📉</Text>
          ),
          title: 'Gastos',
        }}
      />
      <Tab.Screen
        name="Configuracion"
        component={ConfiguracionScreen}
        options={{
          tabBarLabel: 'Ajustes',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, color: focused ? COLORS.primary : COLORS.textMuted }}>⚙️</Text>
          ),
          title: 'Ajustes',
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
          backgroundColor: COLORS.primary, // Header Rosa en Stack
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerTintColor: '#FFFFFF', // Texto Blanco en Stack
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
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
        name="GestionInsumos"
        component={GestionInsumosScreen}
        options={{ title: 'Gestionar Insumos' }}
      />
      <Stack.Screen
        name="CrearInsumo"
        component={CrearInsumoScreen}
        options={{ title: 'Crear Insumo' }}
      />
      <Stack.Screen
        name="EditarStock"
        component={EditarStockScreen}
        options={{ title: 'Editar Stock' }}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ title: 'Agregar Item' }}
      />
      <Stack.Screen
        name="CrearGasto"
        component={CrearGastoScreen}
        options={{ title: 'Registrar Gasto' }}
      />
      <Stack.Screen
        name="EditarGasto"
        component={EditarGastoScreen}
        options={{ title: 'Editar Gasto' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
