import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';

const ConfiguracionScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const configOptions = [
        { title: 'Gestionar Productos', route: 'GestionProductos', icon: '🎂' },
        { title: 'Gestionar Sabores', route: 'GestionSabores', icon: '🍓' },
        { title: 'Gestionar Tamaños/Pesos', route: 'GestionTamanos', icon: '⚖️' },
        { title: 'Gestionar Insumos', route: 'GestionInsumos', icon: '🥄' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <Text style={styles.title}>Configuración</Text>
                {configOptions.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.card}
                        onPress={() => navigation.navigate(option.route as any)}
                    >
                        <Text style={styles.icon}>{option.icon}</Text>
                        <Text style={styles.cardText}>{option.title}</Text>
                        <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg },
    title: { fontSize: FONTS.title, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.xl },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.medium,
    },
    icon: { fontSize: 24, marginRight: SPACING.md },
    cardText: { flex: 1, fontSize: FONTS.medium, color: COLORS.text, fontWeight: '600' },
    arrow: { fontSize: 24, color: COLORS.textLight },
});

export default ConfiguracionScreen;
