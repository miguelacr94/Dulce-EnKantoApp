import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { useInsumos } from '@/features/insumos/hooks/useInsumos';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { Insumo } from '@/features/insumos/types';

type CrearInsumoScreenRouteProp = RouteProp<RootStackParamList, 'CrearInsumo'>;
type CrearInsumoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CrearInsumo'>;

const CrearInsumoScreen: React.FC = () => {
    const navigation = useNavigation<CrearInsumoScreenNavigationProp>();
    const route = useRoute<CrearInsumoScreenRouteProp>();
    const { editingInsumo } = route.params || {};
    
    const { createInsumo, updateInsumo, isLoading } = useInsumos();
    
    // 1️⃣ Estado del Formulario
    const [nombre, setNombre] = useState('');
    const [medida, setMedida] = useState<'peso' | 'tamano' | ''>('');

    // 2️⃣ Cargar datos si estamos editando
    useEffect(() => {
        if (editingInsumo) {
            setNombre(editingInsumo.nombre);
            setMedida(editingInsumo.medida as 'peso' | 'tamano');
        }
    }, [editingInsumo]);

    // Función Guardar con Validación
    const handleSave = async () => {
        // Validación Básica
        if (!nombre.trim()) {
            return Alert.alert('Incompleto', 'Por favor ingresa el nombre del insumo');
        }
        if (!medida) {
            return Alert.alert('Incompleto', 'Por favor selecciona el tipo de medida');
        }

        try {
            const insumoData = { 
                nombre: nombre.trim(), 
                medida: medida as 'peso' | 'tamano' 
            };

            if (editingInsumo) {
                await updateInsumo({ id: editingInsumo.id, updates: insumoData });
                Alert.alert('Éxito', 'Insumo actualizado correctamente.');
            } else {
                await createInsumo(insumoData);
                Alert.alert('Éxito', 'Insumo creado correctamente.');
            }
            
            // Limpiar campos
            setNombre('');
            setMedida('');
            
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', `No se pudo ${editingInsumo ? 'actualizar' : 'crear'} el insumo. Inténtalo de nuevo.`);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {editingInsumo ? 'Editar Insumo' : 'Crear Insumo'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {editingInsumo 
                            ? 'Modifica las propiedades del insumo' 
                            : 'Define las propiedades básicas de tu material'
                        }
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Nombre del Insumo</Text>
                        <TextInput
                            style={styles.input}
                            value={nombre}
                            onChangeText={setNombre}
                            placeholder="Ej. Harina, Bolsas Plásticas, Azúcar"
                            placeholderTextColor="#9EA0A4"
                            autoComplete="off"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo de Medida</Text>
                        <View style={styles.selectionRow}>
                            <TouchableOpacity 
                                style={[
                                    styles.selectionBtn, 
                                    medida === 'peso' && styles.selectionBtnActive
                                ]}
                                onPress={() => setMedida('peso')}
                                activeOpacity={0.8}
                                disabled={isLoading}
                            >
                                <Text style={styles.icon}>⚖️</Text>
                                <Text style={[
                                    styles.selectionText,
                                    medida === 'peso' && styles.selectionTextActive
                                ]}>Peso</Text>
                                <Text style={styles.desc}>Gramos, Kilos, etc.</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[
                                    styles.selectionBtn, 
                                    medida === 'tamano' && styles.selectionBtnActive
                                ]}
                                onPress={() => setMedida('tamano')}
                                activeOpacity={0.8}
                                disabled={isLoading}
                            >
                                <Text style={styles.icon}>📏</Text>
                                <Text style={[
                                    styles.selectionText,
                                    medida === 'tamano' && styles.selectionTextActive
                                ]}>Tamaño</Text>
                                <Text style={styles.desc}>S, M, L, XL, etc.</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]} 
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.textWhite} size="small" />
                        ) : (
                            <Text style={styles.saveBtnText}>
                                {editingInsumo ? 'Actualizar Insumo' : 'Guardar Insumo'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    header: {
        padding: SPACING.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textLight,
        marginTop: 4,
    },
    form: {
        padding: SPACING.xl,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.sm,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        fontSize: 16,
        color: COLORS.text,
    },
    selectionRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    selectionBtn: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        borderWidth: 2,
        borderColor: '#E9ECEF',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
    },
    selectionBtnActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#F0F7FF',
    },
    selectionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 4,
    },
    selectionTextActive: {
        color: COLORS.primary,
    },
    icon: {
        fontSize: 28,
        marginBottom: 4,
    },
    desc: {
        fontSize: 11,
        color: COLORS.textLight,
        marginTop: 2,
        textAlign: 'center',
    },
    saveBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.xl,
        ...SHADOWS.medium,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: COLORS.textWhite,
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelBtn: {
        padding: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.sm,
    },
    cancelBtnText: {
        color: COLORS.textLight,
        fontSize: 16,
    },
});

export default CrearInsumoScreen;
