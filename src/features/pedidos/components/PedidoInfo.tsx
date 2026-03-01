import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils';
import { formatPedidoItems } from '@/utils';

interface PedidoInfoProps {
  pedido: any;
  vencido: boolean;
}

const PedidoInfo: React.FC<PedidoInfoProps> = ({ pedido, vencido }) => {
  return (
    <View style={styles.pedidoInfo}>
      <Text style={[
        styles.productoInfo,
        vencido && styles.textoVencido
      ]}>
        {formatPedidoItems(pedido)}
      </Text>
      {pedido.descripcion && (
        <Text style={[
          styles.descripcion,
          vencido && styles.textoVencido
        ]} numberOfLines={2}>
          {pedido.descripcion}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  pedidoInfo: {
    marginBottom: SPACING.sm,
  },
  productoInfo: {
    fontSize: FONTS.medium,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  descripcion: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  textoVencido: {
    color: '#888888', // Gris medio para textos
  },
});

export default PedidoInfo;
