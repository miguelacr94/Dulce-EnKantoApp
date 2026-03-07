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
    const [tipo, setTipo] = useState<'Sabor' | 'Relleno' | 'Todos'>('Sabor');

    const handleSave = async () => {
        if (!nombre.trim()) return;
        try {
            if (editingSabor) {
                await updateSabor({ id: editingSabor.id, updates: { nombre, tipo } });
            } else {
                await createSabor({ nombre, tipo });
            }
            setModalVisible(false);
            setNombre('');
            setTipo('Sabor');
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
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemText}>{item.nombre}</Text>
                            <View style={[styles.badge, { backgroundColor: item.tipo === 'Sabor' ? '#E3F2FD' : item.tipo === 'Relleno' ? '#F3E5F5' : '#E8F5E9' }]}>
                                <Text style={[styles.badgeText, { color: item.tipo === 'Sabor' ? '#1976D2' : item.tipo === 'Relleno' ? '#7B1FA2' : '#388E3C' }]}>{item.tipo}</Text>
                            </View>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => { setEditingSabor(item); setNombre(item.nombre); setTipo(item.tipo); setModalVisible(true); }}>
                                <Text>✏️</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text>🗑️</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.addButton} onPress={() => { setEditingSabor(null); setNombre(''); setTipo('Sabor'); setModalVisible(true); }}>
                <Text style={styles.addButtonText}>+ Agregar Sabor</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingSabor ? 'Editar Sabor' : 'Nuevo Sabor'}</Text>
                        <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />

                        <Text style={styles.label}>Tipo:</Text>
                        <View style={styles.selectorContainer}>
                            {(['Sabor', 'Relleno', 'Todos'] as const).map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[styles.option, tipo === option && styles.optionSelected]}
                                    onPress={() => setTipo(option)}
                                >
                                    <Text style={[styles.optionText, tipo === option && styles.optionTextSelected]}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
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
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, backgroundColor: COLORS.cardBackground, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, ...SHADOWS.small },
    itemInfo: { flex: 1 },
    itemText: { fontSize: FONTS.medium, fontWeight: '600', marginBottom: 4 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 12, fontWeight: 'bold' },
    actions: { flexDirection: 'row', gap: 15 },
    addButton: { backgroundColor: COLORS.primary, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginTop: SPACING.md },
    addButtonText: { color: 'white', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: 'white', padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl, width: '85%' },
    modalTitle: { fontSize: FONTS.large, fontWeight: 'bold', marginBottom: SPACING.lg },
    label: { fontSize: 14, color: '#666', marginBottom: 8 },
    input: { borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: SPACING.xl, fontSize: FONTS.medium, paddingVertical: 8 },
    selectorContainer: { flexDirection: 'row', gap: 10, marginBottom: SPACING.xl },
    option: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9' },
    optionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    optionText: { color: '#666', fontWeight: '600' },
    optionTextSelected: { color: 'white' },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    cancelButton: { padding: SPACING.md },
    submitButton: { backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md }
});

export default GestionSaboresScreen;
