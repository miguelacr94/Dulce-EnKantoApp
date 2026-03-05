import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useMetadata } from '@/features/productos/hooks';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { Sabor } from '@/types';

const GestionSaboresScreen: React.FC = () => {
    const { sabores, createSabor, updateSabor, deleteSabor, isLoading } = useMetadata();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSabor, setEditingSabor] = useState<Sabor | null>(null);
    const [nombre, setNombre] = useState('');

    const handleSave = async () => {
        if (!nombre.trim()) return;
        try {
            if (editingSabor) {
                await updateSabor({ id: editingSabor.id, updates: { nombre } });
            } else {
                await createSabor({ nombre });
            }
            setModalVisible(false);
            setNombre('');
            setEditingSabor(null);
        } catch (e) {
            Alert.alert('Error', 'No se pudo guardar');
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Eliminar', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => deleteSabor(id) }
        ]);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={sabores}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.itemText}>{item.nombre}</Text>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => { setEditingSabor(item); setNombre(item.nombre); setModalVisible(true); }}>
                                <Text>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingSabor(null); setNombre(''); setModalVisible(true); }}>
                <Text style={styles.addButtonText}>+ Agregar Sabor</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingSabor ? 'Editar Sabor' : 'Nuevo Sabor'}</Text>
                        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
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
    item: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.lg, backgroundColor: COLORS.cardBackground, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, ...SHADOWS.small },
    itemText: { fontSize: FONTS.medium, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 15 },
    addButton: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginTop: SPACING.md },
    addButtonText: { color: 'white', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, width: '80%' },
    modalTitle: { fontSize: FONTS.large, fontWeight: 'bold', marginBottom: SPACING.lg },
    input: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: SPACING.xl, fontSize: FONTS.medium },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelButton: { padding: SPACING.md },
    submitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md }
});

export default GestionSaboresScreen;
