import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useMetadata } from '../hooks/useMetadata';
import { metadataService } from '../services/metadataService';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import { Producto } from '../types';

const GestionProductosScreen: React.FC = () => {
    const { productos, createProducto, updateProducto, deleteProducto, tamanos } = useMetadata();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
    const [formData, setFormData] = useState<Omit<Producto, 'id' | 'created_at'>>({
        nombre: '',
        descripcion: '',
    });

    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            Alert.alert('Error', 'Completa los campos obligatorios');
            return;
        }
        try {
            if (editingProducto) {
                await updateProducto({ id: editingProducto.id, updates: formData });
            } else {
                await createProducto(formData);
            }

            setModalVisible(false);
            setEditingProducto(null);
        } catch (e) {
            // Error al guardar producto
            Alert.alert('Error', 'No se pudo guardar el producto');
        }
    };


    const openModal = async (producto?: Producto) => {
        if (producto) {
            setEditingProducto(producto);
            setFormData({
                nombre: producto.nombre,
                descripcion: producto.descripcion || '',
            });
        } else {
            setEditingProducto(null);
            setFormData({ nombre: '', descripcion: '' });
        }
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={productos}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.itemText}>{item.nombre}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => openModal(item)}>
                                <Text>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteProducto(item.id)}>
                                <Text>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
                <Text style={styles.addButtonText}>+ Agregar Producto</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingProducto ? 'Editar Producto' : 'Nuevo Producto'}</Text>

                        <ScrollView>
                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput style={styles.input} value={formData.nombre} onChangeText={t => setFormData({ ...formData, nombre: t })} />

                            <Text style={styles.label}>Descripción</Text>
                            <TextInput style={styles.input} value={formData.descripcion} onChangeText={t => setFormData({ ...formData, descripcion: t })} multiline />
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.submitButton} onPress={handleSave}><Text style={{ color: 'white' }}>Guardar</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.md },
    item: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.cardBackground, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, ...SHADOWS.small },
    itemText: { fontSize: FONTS.medium, fontWeight: 'bold' },
    subtext: { color: COLORS.textLight, fontSize: 12 },
    actions: { flexDirection: 'row', gap: 15 },
    addButton: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
    addButtonText: { color: 'white', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
    modalContent: { backgroundColor: 'white', margin: 20, padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, maxHeight: '80%' },
    modalTitle: { fontSize: FONTS.large, fontWeight: 'bold', marginBottom: SPACING.lg },
    label: { fontSize: 12, color: COLORS.textLight, marginTop: 10 },
    input: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10, paddingVertical: 5 },
    tipoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 5 },
    tipoChip: { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 15 },
    tipoChipActive: { backgroundColor: COLORS.primary },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginTop: 20, alignItems: 'center' },
    submitButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 5 }
});

export default GestionProductosScreen;
