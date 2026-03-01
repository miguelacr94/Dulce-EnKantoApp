import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { useClientes } from '../hooks/useClientes';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import { formatTelefono } from '../utils/format';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';

type ClientesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Clientes'>,
  StackNavigationProp<RootStackParamList>
>;

const ClientesScreen: React.FC = () => {
  const navigation = useNavigation<ClientesScreenNavigationProp>();
  const { clientes, isLoading, refetch, deleteCliente, isDeleting } = useClientes();
  const [busqueda, setBusqueda] = useState('');

  // Filtrar clientes según la búsqueda
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    cliente.telefono.includes(busqueda) ||
    (cliente.direccion && cliente.direccion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleDeleteCliente = (cliente: any) => {
    Alert.alert(
      'Eliminar Cliente',
      `¿Estás seguro de que quieres eliminar a ${cliente.nombre}?\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCliente(cliente.id),
        },
      ]
    );
  };

  const renderClienteCard = (cliente: any) => (
    <TouchableOpacity
      key={cliente.id}
      style={styles.clienteCard}
      onPress={() => navigation.navigate('ClienteDetalle', { clienteId: cliente.id })}
    >
      <View style={styles.clienteHeader}>
        <View style={styles.clienteInfo}>
          <Text style={styles.clienteNombre}>{cliente.nombre}</Text>
          <Text style={styles.clienteTelefono}>{formatTelefono(cliente.telefono)}</Text>
          {cliente.direccion && (
            <Text style={styles.clienteDireccion} numberOfLines={2}>
              {cliente.direccion}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCliente(cliente)}
          disabled={isDeleting}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.clienteFooter}>
        <Text style={styles.fechaCreacion}>
          Cliente desde: {new Date(cliente.created_at).toLocaleDateString('es-CO')}
        </Text>
        <TouchableOpacity
          style={styles.verPedidosButton}
          onPress={() => navigation.navigate('ClienteDetalle', { clienteId: cliente.id })}
        >
          <Text style={styles.verPedidosText}>Ver pedidos</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, teléfono o dirección..."
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>

      {/* Lista de clientes */}
      <ScrollView
        style={styles.listaContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {clientesFiltrados.length > 0 ? (
          clientesFiltrados.map(renderClienteCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {busqueda ? 'No se encontraron clientes' : 'No hay clientes registrados'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Botón flotante para crear cliente */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CrearCliente')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
  },
  searchInput: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONTS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listaContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  clienteCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.medium,
  },
  clienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clienteTelefono: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  clienteDireccion: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#FFE4E1',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  clienteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  fechaCreacion: {
    fontSize: FONTS.tiny,
    color: COLORS.textMuted,
  },
  verPedidosButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '20',
  },
  verPedidosText: {
    fontSize: FONTS.tiny,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONTS.medium,
    color: COLORS.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  fabText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
});

export default ClientesScreen;
