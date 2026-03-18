import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { Producto, Sabor, Tamano } from '@/types';
import { CrearPedidoItemDTO } from '@/features/pedidos/types';
import { useMetadata } from '@/features/productos';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '@/utils';
import { metadataService } from '@/services';

type AddItemScreenRouteProp = RouteProp<RootStackParamList, 'AddItem'>;
type AddItemScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddItem'>;

const AddItemScreen: React.FC = () => {
    const navigation = useNavigation<AddItemScreenNavigationProp>();
    const route = useRoute<AddItemScreenRouteProp>();
    const { initialItem, editingIndex, returnTo } = route.params;

    console.log('AddItemScreen montado con parámetros:', { initialItem, editingIndex, returnTo });

    const { productos, sabores, tamanos, isLoading: isLoadingMetadata } = useMetadata();

    const [tempItem, setTempItem] = useState<CrearPedidoItemDTO>(
        initialItem || {
            producto_id: '',
            sabor_id: null,
            relleno_id: null,
            tamano_id: null,
            cantidad: 1,
            precio_unitario: 0,
        }
    );

    const [filteredOptions, setFilteredOptions] = useState<{
        sabores: Sabor[];
        tamanos: Tamano[];
    }>({
        sabores: [],
        tamanos: [],
    });

    const [showProductoSelector, setShowProductoSelector] = useState(false);

    useEffect(() => {
        if (tempItem.producto_id) {
            loadFilteredOptions(tempItem.producto_id);
        }
    }, [tempItem.producto_id]);

    const loadFilteredOptions = async (productoId: string) => {
        try {
            const [fSabores, fTamanos] = await Promise.all([
                metadataService.getSaboresPorProducto(productoId),
                metadataService.getTamanosPorProducto(productoId),
            ]);

            setFilteredOptions({
                sabores: fSabores || [],
                tamanos: fTamanos || [],
            });
        } catch (error) {
            console.error('Error filtrando opciones:', error);
        }
    };

    const updateTempItem = (field: keyof CrearPedidoItemDTO, value: any) => {
        setTempItem({ ...tempItem, [field]: value });
    };

    const validateForm = (): boolean => {
        if (!tempItem.producto_id) {
            Alert.alert('Error', 'Debe seleccionar un producto');
            return false;
        }
        if (!tempItem.cantidad || tempItem.cantidad <= 0) {
            Alert.alert('Error', 'La cantidad debe ser mayor a 0');
            return false;
        }
        if (tempItem.precio_unitario < 0) {
            Alert.alert('Error', 'El precio unitario no puede ser negativo');
            return false;
        }

        const selectedProduct = productos.find(p => p.id === tempItem.producto_id);
        if (selectedProduct?.tipo_medida && !tempItem.tamano_id) {
            const tipoTexto = selectedProduct.tipo_medida === 'peso' ? 'peso' : 'tamaño';
            Alert.alert('Error', `Debe seleccionar un ${tipoTexto} para este producto`);
            return false;
        }

        return true;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            console.log('AddItem handleSubmit - tempItem:', tempItem);
            console.log('AddItem handleSubmit - editingIndex:', editingIndex);
            console.log('AddItem handleSubmit - returnTo:', returnTo);
            
            if (returnTo === 'CrearPedido') {
                console.log('Navegando a CrearPedido con:', {
                    newItem: tempItem,
                    editingIndex: editingIndex,
                });
                navigation.navigate('CrearPedido', {
                    newItem: tempItem,
                    editingIndex: editingIndex,
                });
            } else {
                console.log('Volviendo a EditarPedido con:', {
                    newItem: tempItem,
                    editingIndex: editingIndex,
                });
                // Usar setParams para pasar los datos sin recargar la pantalla
                navigation.setParams({
                    newItem: tempItem,
                    editingIndex: editingIndex,
                } as any);
                navigation.goBack();
            }
        }
    };

    const selectedProduct = productos.find(p => p.id === tempItem.producto_id);
    const tamanosFiltrados = selectedProduct?.tipo_medida
        ? tamanos.filter(t => t.tipo === selectedProduct.tipo_medida)
        : tamanos;

    if (isLoadingMetadata) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Cargando metadatos...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView
                    style={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <Text style={styles.title}>
                            {editingIndex !== undefined ? 'Editar Item' : 'Agregar Item'}
                        </Text>

                        {/* Producto */}
                        <TouchableOpacity
                            style={styles.fieldContainer}
                            onPress={() => setShowProductoSelector(true)}
                        >
                            <Text style={styles.label}>Producto *</Text>
                            <View style={styles.selectorButton}>
                                <Text style={styles.selectorText}>
                                    {productos.find(p => p.id === tempItem.producto_id)?.nombre ||
                                        'Seleccionar producto...'}
                                    {selectedProduct?.tipo_medida && (
                                        <Text style={styles.tipoMedidaText}>
                                            {' '}({selectedProduct.tipo_medida === 'peso' ? 'Por peso' : 'Por tamaño'})
                                        </Text>
                                    )}
                                </Text>
                                <Text>▼</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Sabor */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Sabor</Text>
                            <View style={styles.chipRow}>
                                {sabores.filter(s => s.tipo === 'Sabor' || s.tipo === 'Todos').length > 0 ? (
                                    sabores
                                        .filter(s => s.tipo === 'Sabor' || s.tipo === 'Todos')
                                        .map(s => (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={[
                                                    styles.chip,
                                                    tempItem.sabor_id === s.id && styles.chipActive
                                                ]}
                                                onPress={() => updateTempItem('sabor_id', s.id)}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    tempItem.sabor_id === s.id && styles.chipTextActive
                                                ]}>
                                                    {s.nombre}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                ) : (
                                    <Text style={styles.emptyText}>No hay sabores configurados</Text>
                                )}
                                <TouchableOpacity
                                    style={[
                                        styles.chip,
                                        !tempItem.sabor_id && styles.chipActive
                                    ]}
                                    onPress={() => updateTempItem('sabor_id', null)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        !tempItem.sabor_id && styles.chipTextActive
                                    ]}>
                                        Ninguno
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Relleno */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Relleno</Text>
                            <View style={styles.chipRow}>
                                {sabores.filter(s => s.tipo === 'Relleno' || s.tipo === 'Todos').length > 0 ? (
                                    sabores
                                        .filter(s => s.tipo === 'Relleno' || s.tipo === 'Todos')
                                        .map(s => (
                                            <TouchableOpacity
                                                key={s.id}
                                                style={[
                                                    styles.chip,
                                                    tempItem.relleno_id === s.id && styles.chipActive
                                                ]}
                                                onPress={() => updateTempItem('relleno_id', s.id)}
                                            >
                                                <Text style={[
                                                    styles.chipText,
                                                    tempItem.relleno_id === s.id && styles.chipTextActive
                                                ]}>
                                                    {s.nombre}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                ) : (
                                    <Text style={styles.emptyText}>No hay sabores configurados</Text>
                                )}
                                <TouchableOpacity
                                    style={[
                                        styles.chip,
                                        !tempItem.relleno_id && styles.chipActive
                                    ]}
                                    onPress={() => updateTempItem('relleno_id', null)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        !tempItem.relleno_id && styles.chipTextActive
                                    ]}>
                                        Ninguno
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Tamaño */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>
                                {selectedProduct?.tipo_medida === 'peso' ? 'Peso' : 'Tamaño'}
                                {selectedProduct?.tipo_medida && ' *'}
                            </Text>
                            <View style={styles.chipRow}>
                                {tamanosFiltrados.length > 0 ? (
                                    tamanosFiltrados.map(t => (
                                        <TouchableOpacity
                                            key={t.id}
                                            style={[
                                                styles.chip,
                                                tempItem.tamano_id === t.id && styles.chipActive
                                            ]}
                                            onPress={() => updateTempItem('tamano_id', t.id)}
                                        >
                                            <Text style={[
                                                styles.chipText,
                                                tempItem.tamano_id === t.id && styles.chipTextActive
                                            ]}>
                                                {t.nombre}
                                            </Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text style={styles.emptyText}>
                                        No hay {selectedProduct?.tipo_medida === 'peso' ? 'pesos' : 'tamaños'} configurados
                                    </Text>
                                )}
                                {!selectedProduct?.tipo_medida && (
                                    <TouchableOpacity
                                        style={[
                                            styles.chip,
                                            !tempItem.tamano_id && styles.chipActive
                                        ]}
                                        onPress={() => updateTempItem('tamano_id', null)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            !tempItem.tamano_id && styles.chipTextActive
                                        ]}>
                                            Ninguno
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Cantidad */}
                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Cantidad *</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={tempItem.cantidad.toString()}
                                onChangeText={(val) => updateTempItem('cantidad', parseInt(val) || 0)}
                            />
                        </View>

                        {/* Precio Unitario */}
                        <View style={[styles.fieldContainer, styles.lastField]}>
                            <Text style={styles.label}>Precio Unitario *</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={tempItem.precio_unitario.toString()}
                                onChangeText={(val) => updateTempItem('precio_unitario', parseFloat(val) || 0)}
                            />
                        </View>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>
                                    {editingIndex !== undefined ? 'Guardar Cambios' : 'Agregar al Pedido'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Modal de selección de producto */}
                <View>
                    <Modal visible={showProductoSelector} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Seleccionar Producto</Text>
                                <ScrollView>
                                    {[...productos].reverse().map(p => (
                                        <TouchableOpacity
                                            key={p.id}
                                            style={styles.modalItem}
                                            onPress={() => {
                                                updateTempItem('producto_id', p.id);
                                                setShowProductoSelector(false);
                                            }}
                                        >
                                            <Text style={styles.modalItemText}>
                                                {p.nombre}
                                                {p.tipo_medida && (
                                                    <Text style={styles.tipoMedidaText}>
                                                        {' '}({p.tipo_medida === 'peso' ? 'Por peso' : 'Por tamaño'})
                                                    </Text>
                                                )}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setShowProductoSelector(false)}
                                >
                                    <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: SPACING.lg,
    },
    title: {
        fontSize: FONTS.heading,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    fieldContainer: {
        marginBottom: SPACING.lg,
    },
    lastField: {
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.xs,
        color: COLORS.text,
    },
    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        ...SHADOWS.small,
    },
    selectorText: {
        fontSize: 16,
        color: COLORS.text,
    },
    tipoMedidaText: {
        fontSize: 12,
        color: COLORS.textLight,
        fontStyle: 'italic',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 5,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: 'transparent',
    },
    chipActive: {
        backgroundColor: COLORS.primary,
    },
    chipText: {
        fontSize: 14,
        color: COLORS.primary,
    },
    chipTextActive: {
        color: 'white',
    },
    emptyText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    input: {
        backgroundColor: COLORS.cardBackground,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        fontSize: 16,
        color: COLORS.text,
        ...SHADOWS.small,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    cancelButton: {
        flex: 1,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelButtonText: {
        color: COLORS.text,
        fontWeight: '600',
    },
    submitButton: {
        flex: 2,
        backgroundColor: COLORS.primary,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        ...SHADOWS.small,
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        width: '100%',
        maxHeight: '80%',
        ...SHADOWS.large,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        color: COLORS.text,
        textAlign: 'center',
    },
    modalItem: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalItemText: {
        fontSize: 16,
        color: COLORS.text,
    },
    modalCloseButton: {
        marginTop: SPACING.lg,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalCloseButtonText: {
        color: COLORS.text,
        fontWeight: '600',
    },
});

export default AddItemScreen;
