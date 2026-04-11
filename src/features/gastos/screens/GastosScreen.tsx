import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useGastos, useEliminarGasto } from '../hooks/use-gastos.hook';
import { Gasto } from '../types/gasto.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const GastosScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { data: gastos, isLoading, isError, refetch } = useGastos();
  const { mutate: eliminarGasto } = useEliminarGasto();

  const handleEliminar = (id: string) => {
    Alert.alert(
      'Eliminar Gasto',
      '¿Estás seguro de que deseas eliminar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminarGasto(id) },
      ]
    );
  };

  const renderGasto = ({ item }: { item: Gasto }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.fechaText}>
          {format(new Date(item.fecha), "eeee, d 'de' MMMM", { locale: es })}
        </Text>
        <Text style={styles.categoriaText}>{item.categoria}</Text>
        {item.descripcion && (
          <Text style={styles.descripcionText}>{item.descripcion}</Text>
        )}
      </View>
      <View style={styles.actionsContainer}>
        <Text style={styles.montoText}>
          ${Number(item.monto).toLocaleString('es-CL')}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditarGasto', { gastoId: item.id })}
            style={[styles.actionButton, styles.editButton]}
          >
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleEliminar(item.id)}
            style={[styles.actionButton, styles.deleteButton]}
          >
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF69B4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={gastos}
        keyExtractor={(item) => item.id}
        renderItem={renderGasto}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={gastos?.length === 0 ? styles.emptyList : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay gastos registrados 🌸</Text>
          </View>
        }
      />
      
      <TouchableOpacity
        onPress={() => navigation.navigate('CrearGasto')}
        style={styles.fab}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCE7F3', // Rosa muy claro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
  },
  actionsContainer: {
    alignItems: 'flex-end',
  },
  fechaText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  categoriaText: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  descripcionText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  montoText: {
    color: '#DB2777', // Rosa intenso
    fontWeight: '900',
    fontSize: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 99,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#EFF6FF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#EC4899',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 18,
  },
});
