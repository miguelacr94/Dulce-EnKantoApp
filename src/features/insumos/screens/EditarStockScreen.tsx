import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useInsumos } from '@/features/insumos/hooks/useInsumos';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { InsumoTamano, Tamano } from '@/features/insumos/types';

type EditarStockScreenRouteProp = RouteProp<RootStackParamList, 'EditarStock'>;

interface MergedStock {
    tamano_id: string;
    nombre: string;
    cantidad: string; // Como texto para el input
    insumo_tamano_id?: string; // Si ya existe en DB
}

const EditarStockScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<EditarStockScreenRouteProp>();
    const { insumo } = route.params;
    
    // Hooks de datos
    const { loadTamanosPorTipo, loadStockPropio, saveStockBulk, isLoading } = useInsumos();
    
    // Estado para la UI: Lista mezclada de tamaños y stock
    const [mergedStocks, setMergedStocks] = useState<MergedStock[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    // 1️⃣ Inicialización: Cargar tamaños y stock actual
    useEffect(() => {
        const initdata = async () => {
            setIsFetching(true);
            try {
                // Traer todos los tamaños posibles para la medida del insumo (Peso o Tamaño)
                const todosLosTamanos = await loadTamanosPorTipo(insumo.medida as 'peso' | 'tamano');
                
                // Traer el stock que ya existe en DB para este insumo
                const stockExistente = await loadStockPropio(insumo.id);
                
                // Combinar: Mostrar todos los tamaños, asignando cantidad=0 si no hay stock previo
                const merged = todosLosTamanos.map((t: Tamano) => {
                    const stock = stockExistente.find(s => s.tamano_id === t.id);
                    return {
                        tamano_id: t.id as string,
                        nombre: t.nombre,
                        cantidad: stock ? stock.cantidad.toString() : '0',
                        insumo_tamano_id: stock?.id
                    };
                });
                
                setMergedStocks(merged);
            } catch (error) {
                Alert.alert('Error', 'No se pudieron cargar los datos de stock');
            } finally {
                setIsFetching(false);
            }
        };

        if (insumo) initdata();
    }, [insumo]);

    // 2️⃣ Manejo de Inputs Numéricos
    const handleUpdateQuantity = (tamano_id: string, text: string) => {
        const numericValue = text.replace(/[^0-9]/g, ''); // Solo números positivos
        setMergedStocks(prev => 
            prev.map(it => it.tamano_id === tamano_id ? { ...it, cantidad: numericValue } : it)
        );
    };

    // 3️⃣ Guardar Todo el Stock (Bulk Save)
    const handleSaveAll = async () => {
        // Validaciones básicas
        const stocksToSave = mergedStocks.map(it => ({
            id: it.insumo_tamano_id,
            insumo_id: insumo.id,
            tamano_id: it.tamano_id,
            cantidad: parseInt(it.cantidad || '0', 10)
        }));

        try {
            await saveStockBulk(stocksToSave);
            Alert.alert('🎉 Listo', 'El stock ha sido actualizado correctamente.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el stock masivamente.');
        }
    };

    const renderStockRow = ({ item }: { item: MergedStock }) => (
        <View style={styles.stockCard}>
            <View style={styles.stockHeader}>
                <Text style={styles.tamanoNombre}>{item.nombre}</Text>
                <Text style={styles.tipoLabel}>Tipo: {insumo.medida === 'peso' ? '⚖️ Peso' : '📏 Medida'}</Text>
            </View>
            
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={item.cantidad}
                    onChangeText={(text) => handleUpdateQuantity(item.tamano_id, text)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#ADB5BD"
                    selectTextOnFocus
                />
                <Text style={styles.cantidadLabel}>unid.</Text>
            </View>
        </View>
    );

    if (isFetching) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Cargando stock...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.insumoTitle}>{insumo.nombre}</Text>
                <Text style={styles.insumoSub}>Configura el stock disponible para cada tamaño</Text>
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={120}
            >
                <FlatList
                    data={mergedStocks}
                    keyExtractor={(it) => it.tamano_id.toString()}
                    renderItem={renderStockRow}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay tamaños definidos para este tipo de medida.</Text>
                    }
                />
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.saveBtn, isLoading && styles.disabledBtn]} 
                    onPress={handleSaveAll}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={COLORS.textWhite} size="small" />
                    ) : (
                        <Text style={styles.saveBtnText}>Asignar Stock</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.textLight,
        fontSize: 14,
    },
    header: {
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    insumoTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    insumoSub: {
        fontSize: 14,
        color: COLORS.textLight,
        marginTop: 4,
    },
    listContent: {
        padding: SPACING.lg,
    },
    stockCard: {
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.small,
    },
    stockHeader: {
        flex: 1,
    },
    tamanoNombre: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    tipoLabel: {
        fontSize: 12,
        color: COLORS.textLight,
        marginTop: 2,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        backgroundColor: '#F1F3F5',
        borderWidth: 1,
        borderColor: '#DEE2E6',
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: 12,
        paddingVertical: 10,
        width: 80,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    cantidadLabel: {
        fontSize: 14,
        color: COLORS.textLight,
        fontWeight: '600',
    },
    footer: {
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
        alignItems: 'center',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        width: '100%',
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    disabledBtn: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: COLORS.textWhite,
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
});

export default EditarStockScreen;
