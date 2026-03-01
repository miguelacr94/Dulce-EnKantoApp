import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/app/navigation/AppNavigator';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '@/utils';
import { formatCurrency, estaVencido, getTextoHorasAtraso } from '@/utils';
import { PedidoHeader, PedidoInfo, PedidoFooter } from './index';

interface PedidoCardProps {
  pedido: any;
}

type PedidoCardNavigationProp = StackNavigationProp<RootStackParamList>;

const PedidoCard: React.FC<PedidoCardProps> = ({ pedido }) => {
  const navigation = useNavigation<PedidoCardNavigationProp>();
  const vencido = estaVencido(pedido.fecha_entrega);

  return (
    <TouchableOpacity
      style={[
        styles.pedidoCard,
        vencido && styles.pedidoCardVencido
      ]}
      onPress={() => navigation.navigate('PedidoDetalle', { pedidoId: pedido.id })}
    >
      <PedidoHeader pedido={pedido} vencido={vencido} />
      <PedidoInfo pedido={pedido} vencido={vencido} />
      <PedidoFooter pedido={pedido} vencido={vencido} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pedidoCard: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  pedidoCardVencido: {
    backgroundColor: '#F5F5F5', 
    opacity: 0.8, 
  },
  pedidoCardCompact: {
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
});

export default PedidoCard;
