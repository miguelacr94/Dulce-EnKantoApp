import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '@/utils';
import { getTextoDiasRestantes, getEstadoColor, formatTime } from '@/utils';

interface PedidoFooterProps {
  pedido: any;
  vencido: boolean;
}

const PedidoFooter: React.FC<PedidoFooterProps> = ({ pedido, vencido }) => {
  return (
    <View style={styles.pedidoFooter}>
      <View style={styles.fechaContainer}>
        <Text style={[
          styles.fechaEntrega,
          vencido && pedido.estado !== 'entregado' ? styles.fechaVencida : pedido.estado === 'entregado' ? styles.fechaEntregada : styles.textoVencido
        ]}>
          {pedido.estado === 'entregado' 
            ? getTextoDiasRestantes(pedido.fecha_entrega).replace('Vencido', 'Entregado')
            : getTextoDiasRestantes(pedido.fecha_entrega)
          }
        </Text>
        <Text style={[
          styles.horaEntrega,
          vencido && pedido.estado !== 'entregado' && styles.textoVencido
        ]}>
          {formatTime(pedido.fecha_entrega)}
        </Text>
      </View>
      <View style={[
        styles.estadoBadge,
        { backgroundColor: getEstadoColor(pedido.estado) + '20' }
      ]}>
        <Text style={[
          styles.estadoText,
          { color: getEstadoColor(pedido.estado) }
        ]}>
          {pedido.estado ? pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1) : 'Sin estado'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pedidoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fechaContainer: {
    flex: 1,
  },
  fechaEntrega: {
    fontSize: FONTS.small,
    color: COLORS.warning,
    fontWeight: '500',
  },
  horaEntrega: {
    fontSize: FONTS.tiny,
    color: COLORS.textLight,
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  estadoText: {
    fontSize: FONTS.tiny,
    fontWeight: 'bold',
  },
  textoVencido: {
    color: '#888888', // Gris medio para textos
  },
  fechaVencida: {
    color: '#FF4444', // Rojo para fechas vencidas
    fontWeight: '600',
  },
  fechaEntregada: {
    color: COLORS.success, // Verde para pedidos entregados
    fontWeight: '500',
  },
});

export default PedidoFooter;
