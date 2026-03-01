import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '@/utils';
import { formatCurrency, getTextoHorasAtraso, getHoraLocal } from '@/utils';

interface PedidoHeaderProps {
  pedido: any;
  vencido: boolean;
}

const PedidoHeader: React.FC<PedidoHeaderProps> = ({ pedido, vencido }) => {
  const textoAtraso = getTextoHorasAtraso(pedido.fecha_entrega);
  
  // Logging temporal para verificar el cálculo
  if (vencido && textoAtraso) {
    const horaLocal = getHoraLocal(pedido.fecha_entrega);
    console.log(`Pedido ${pedido.id}: ${textoAtraso}`);
    console.log(`  - Fecha entrega UTC: ${pedido.fecha_entrega}`);
    console.log(`  - Hora entrega local: ${horaLocal}`);
    console.log(`  - Estado: ${vencido ? 'VENCIDO' : 'A TIEMPO'}`);
  }
  
  return (
    <View style={styles.pedidoHeader}>
      <View style={styles.clienteInfo}>
        <Text style={[
          styles.clienteNombre, 
          vencido && styles.textoVencido
        ]}>
          {pedido.cliente_nombre || 'Sin nombre'}
        </Text>
        <Text style={[
          styles.clienteTelefono,
          vencido && styles.textoVencido
        ]}>
          {pedido.cliente_telefono || 'Sin teléfono'}
        </Text>
      </View>
      <View style={styles.precioContainer}>
        <Text style={[
          styles.precio,
          vencido && styles.textoVencido
        ]}>
          {formatCurrency(pedido.precio_total)}
        </Text>
        {pedido.total_abonado > 0 && (
          <Text style={[
            styles.saldoAbonado,
            vencido && styles.textoVencido
          ]}>
           Abonado: {formatCurrency(pedido.total_abonado)}
          </Text>
        )}
        {pedido.saldo_pendiente > 0 && (
          <Text style={[
            styles.saldoPendiente,
            vencido && styles.textoVencido
          ]}>
            Restante: {formatCurrency(pedido.saldo_pendiente)}
          </Text>
        )}
        {vencido && textoAtraso && (
          <Text style={styles.textoAtraso}>
            {textoAtraso}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  clienteInfo: {
    flex: 1,
  },
  clienteNombre: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  clienteTelefono: {
    fontSize: FONTS.small,
    color: COLORS.textLight,
  },
  precioContainer: {
    alignItems: 'flex-end',
  },
  precio: {
    fontSize: FONTS.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  saldoPendiente: {
    fontSize: FONTS.small,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  saldoAbonado: {
    fontSize: FONTS.small,
    color: COLORS.success,
    marginTop: SPACING.xs,
  },
  textoVencido: {
    color: '#888888', // Gris medio para textos
  },
  textoAtraso: {
    fontSize: FONTS.small,
    fontWeight: 'bold',
    color: '#D32F2F', // Rojo para retraso
    marginTop: SPACING.xs,
    backgroundColor: '#FFEBEE', // Fondo rojo claro
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default PedidoHeader;
