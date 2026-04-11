import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useInsumos } from '@/features/insumos/hooks/useInsumos';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { Insumo, InsumoTamano } from '@/features/insumos/types';

type GestionInsumosScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GestionInsumos'>;

const GestionInsumosScreen: React.FC = () => {
    const navigation = useNavigation<GestionInsumosScreenNavigationProp>();
    const { insumos, deleteInsumo, isLoading, loadInsumos } = useInsumos();
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadInsumos();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadInsumos();
        setRefreshing(false);
    }, [loadInsumos]);

    const handleDelete = (id: number) => {
        Alert.alert(
            'Eliminar Insumo',
            '¿Estás seguro de que deseas eliminar este insumo y todo su stock relacionado?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => deleteInsumo(id),
                },
            ]
        );
    };

    const openCrearInsumo = (insumo?: Insumo) => {
        navigation.navigate('CrearInsumo', { editingInsumo: insumo });
    };

    const handleFabPress = () => {
        openCrearInsumo();
    };

    const renderTamanoItem = (it: InsumoTamano) => (
        <View key={it.id} style={styles.tamanoBadge}>
            <Text style={styles.tamanoNombre}>{it.tamano?.nombre || '?'}</Text>
            <View style={styles.cantidadContainer}>
                <Text style={styles.tamanoCantidad}>{it.cantidad}</Text>
            </View>
        </View>
    );

    const renderInsumo = ({ item }: { item: Insumo }) => (
        <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate('EditarStock', { insumo: item })}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.insumoNombre}>{item.nombre}</Text>
                    <Text style={styles.insumoMedida}>Tipo: {item.medida === 'peso' ? '⚖️ Peso' : '📏 Tamaño'}</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={() => openCrearInsumo(item)} style={styles.editBtn}>
                        <Text style={styles.editIcon}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                        <Text style={styles.deleteIcon}>🗑️</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.tamanosContainer}>
                {item.insumo_tamanos && item.insumo_tamanos.length > 0 ? (
                    item.insumo_tamanos.map(renderTamanoItem)
                ) : (
                    <Text style={styles.noTamanos}>No hay tamaños configurados</Text>
                )}
            </View>
            
            <View style={styles.cardFooter}>
                <Text style={styles.editText}>Toca para editar stock</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Inventario de Insumos</Text>
                <Text style={styles.subtitle}>Gestiona el stock de tus materiales</Text>
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : insumos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📦</Text>
                    <Text style={styles.emptyTitle}>Sin Insumos</Text>
                    <Text style={styles.emptyText}>Registra tu primer insumo para empezar a controlar tu stock.</Text>
                </View>
            ) : (
                <FlatList
                    data={insumos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderInsumo}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={handleFabPress}
                disabled={isLoading}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        padding: SPACING.lg,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 4,
    },
    listContainer: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        ...SHADOWS.small,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.primary,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    insumoNombre: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.text,
    },
    insumoMedida: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    editBtn: {
        padding: 5,
    },
    editIcon: {
        fontSize: 18,
    },
    deleteBtn: {
        padding: 5,
    },
    deleteIcon: {
        fontSize: 18,
    },
    tamanosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: SPACING.sm,
    },
    tamanoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        borderRadius: BORDER_RADIUS.md,
        paddingLeft: SPACING.sm,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tamanoNombre: {
        fontSize: 13,
        fontWeight: '500',
        color: COLORS.text,
        marginRight: 8,
    },
    cantidadContainer: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderTopRightRadius: BORDER_RADIUS.md,
        borderBottomRightRadius: BORDER_RADIUS.md,
    },
    tamanoCantidad: {
        fontSize: 13,
        fontWeight: 'bold',
        color: COLORS.textWhite,
    },
    cardFooter: {
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        alignItems: 'center',
    },
    editText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: '600',
    },
    noTamanos: {
        fontSize: 12,
        fontStyle: 'italic',
        color: COLORS.textLight,
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg,
        backgroundColor: COLORS.primary,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
        elevation: 5,
    },
    fabText: {
        fontSize: 32,
        color: COLORS.textWhite,
        lineHeight: 35,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: SPACING.md,
        opacity: 0.3,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.textLight,
        textAlign: 'center',
    },
});

export default GestionInsumosScreen;
