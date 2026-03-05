import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, FlatList } from 'react-native';
import { useMetadata } from '@/features/productos/hooks';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { Tamano } from '@/types';

const GestionTamanosScreen: React.FC = () => {
    const { tamanos, createTamano, updateTamano, deleteTamano } = useMetadata();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTamano, setEditingTamano] = useState<Tamano | null>(null);
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState<'peso' | 'tamano'>('tamano');

    const handleSave = async () => {
        if (!nombre.trim()) return;
        try {
            if (editingTamano) {
                await updateTamano({ id: editingTamano.id, updates: { nombre, tipo } });
            } else {
                await createTamano({ nombre, tipo });
            }
            setModalVisible(false);
            setNombre('');
            setEditingTamano(null);
        } catch (e) {
            Alert.alert('Error', 'No se pudo guardar');
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={tamanos}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View>
                            <Text style={styles.itemText}>{item.nombre}</Text>
                            <Text style={{ color: COLORS.textLight }}>{item.tipo === 'peso' ? '⚖️ Peso' : '📏 Tamaño'}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => { setEditingTamano(item); setNombre(item.nombre); setTipo(item.tipo); setModalVisible(true); }}>
                                <Text>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteTamano(item.id)}>
                                <Text>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingTamano(null); setNombre(''); setModalVisible(true); }}>
                <Text style={styles.addButtonText}>+ Agregar Tamaño/Peso</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingTamano ? 'Editar' : 'Nuevo'}</Text>
                        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre (ej: 1/2 libra, 12 unidades)" />

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: SPACING.xl }}>
                            <TouchableOpacity
                                style={[styles.tipoBtn, tipo === 'peso' && styles.tipoBtnActive]}
                                onPress={() => setTipo('peso')}
                            >
                                <Text style={{ color: tipo === 'peso' ? 'white' : 'black' }}>Peso</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tipoBtn, tipo === 'tamano' && styles.tipoBtnActive]}
                                onPress={() => setTipo('tamano')}
                            >
                                <Text style={{ color: tipo === 'tamano' ? 'white' : 'black' }}>Tamaño</Text>
                            </TouchableOpacity>
                        </View>

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
    item: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.lg, backgroundColor: COLORS.cardBackground, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, ...SHADOWS.small },
    itemText: { fontSize: FONTS.medium, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 15 },
    addButton: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
    addButtonText: { color: 'white', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, width: '85%' },
    modalTitle: { fontSize: FONTS.large, fontWeight: 'bold', marginBottom: SPACING.lg },
    input: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: SPACING.xl, fontSize: FONTS.medium },
    tipoBtn: { flex: 1, padding: 10, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 5, alignItems: 'center' },
    tipoBtnActive: { backgroundColor: COLORS.primary },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, alignItems: 'center' },
    submitButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 5 }
});

export default GestionTamanosScreen;
