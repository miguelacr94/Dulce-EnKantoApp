import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { formatCurrency, formatDateTime } from '@/utils';
import { COLORS, SPACING, BORDER_RADIUS, FONTS, SHADOWS } from '@/utils';

interface OrderSummaryProps {
  precioTotal: number;
  precioDomicilio: number;
  esDomicilio: boolean;
  direccionEnvio: string;
  abonoInicial: number;
  totalAbonado: number;
  onAbonoChange: (value: number) => void;
  onPrecioDomicilioChange: (value: number) => void;
  onEsDomicilioChange: (value: boolean) => void;
  onDireccionEnvioChange: (text: string) => void;
  fechaEntrega: string;
  onFechaChange: () => void;
  onHoraChange: () => void;
  descripcion: string;
  onDescripcionChange: (text: string) => void;
  descripcionHeight: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  precioTotal,
  precioDomicilio,
  esDomicilio,
  direccionEnvio,
  abonoInicial,
  totalAbonado,
  onAbonoChange,
  onPrecioDomicilioChange,
  onEsDomicilioChange,
  onDireccionEnvioChange,
  fechaEntrega,
  onFechaChange,
  onHoraChange,
  descripcion,
  onDescripcionChange,
  descripcionHeight,
}) => {
  // Calcular subtotal sin domicilio
  const subtotal = precioTotal - (esDomicilio ? precioDomicilio : 0);
  const saldoPendiente = precioTotal - totalAbonado - abonoInicial;

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const formatTimeLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return 'Hora inválida';
    }
  };

  return (
    <>
      {/* Totales */}
      <View style={styles.card}>
        <Text style={styles.priceTotal}>
          Total: {formatCurrency(precioTotal)}
        </Text>

        {/* Detalle de precios */}
        <View style={styles.precioDetalle}>
          <Text style={styles.precioItem}>Subtotal productos: {formatCurrency(subtotal)}</Text>
          {esDomicilio && (
            <Text style={styles.precioItem}>
              Domicilio: {formatCurrency(precioDomicilio)}
            </Text>
          )}
          {totalAbonado > 0 && (
            <Text style={[styles.precioItem, { color: COLORS.success, fontWeight: '600' }]}>
              Abonado registrado: {formatCurrency(totalAbonado)}
            </Text>
          )}
        </View>

        {/* Opción de domicilio */}
        <View style={styles.domicilioContainer}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>¿Con domicilio?</Text>
            <Switch
              value={esDomicilio}
              onValueChange={onEsDomicilioChange}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.cardBackground}
            />
          </View>

          {esDomicilio && (
            <>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Precio del domicilio</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={precioDomicilio.toString()}
                  onChangeText={(val) => onPrecioDomicilioChange(parseFloat(val) || 0)}
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Dirección de envío</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Ingrese la dirección completa..."
                  value={direccionEnvio}
                  onChangeText={onDireccionEnvioChange}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </>
          )}
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            {totalAbonado > 0 ? 'Agregar nuevo abono' : 'Abono Inicial'}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="$ 0.00"
            value={abonoInicial === 0 ? '' : abonoInicial.toString()}
            onChangeText={(val) => onAbonoChange(parseFloat(val) || 0)}
          />
        </View>

        <View style={styles.saldoContainer}>
          <Text style={styles.saldoText}>
            Saldo restante:{' '}
            <Text style={{ fontWeight: 'bold', color: saldoPendiente <= 0 ? COLORS.success : COLORS.error }}>
              {formatCurrency(Math.max(0, saldoPendiente))}
            </Text>
          </Text>
          {saldoPendiente < 0 && (
            <Text style={[styles.saldoText, { fontSize: 10, color: COLORS.warning }]}>
              (El abono supera el total)
            </Text>
          )}
        </View>
      </View>

      {/* Entrega */}
      <View style={styles.deliveryContainer}>
        <TouchableOpacity
          style={[styles.fieldContainer, { flex: 1, marginRight: SPACING.sm }]}
          onPress={onFechaChange}
        >
          <Text style={styles.label}>Fecha *</Text>
          <View style={styles.selectorButton}>
            <Text style={styles.selectorText}>
              {formatDateLabel(fechaEntrega)}
            </Text>
            <Text>📅</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.fieldContainer, { flex: 1, marginLeft: SPACING.sm }]}
          onPress={onHoraChange}
        >
          <Text style={styles.label}>Hora *</Text>
          <View style={styles.selectorButton}>
            <Text style={styles.selectorText}>
              {formatTimeLabel(fechaEntrega)}
            </Text>
            <Text>🕒</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Descripción */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[
            styles.input,
            styles.textarea,
            { height: descripcionHeight }
          ]}
          placeholder="Detalles adicionales del pedido..."
          value={descripcion}
          onChangeText={onDescripcionChange}
          multiline
          textAlignVertical="top"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  priceTotal: {
    fontSize: FONTS.heading,
    fontWeight: 'bold' as const,
    color: COLORS.primary,
    textAlign: 'center' as const,
    marginBottom: SPACING.md,
  },
  deliveryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  precioDetalle: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  precioItem: {
    fontSize: FONTS.small,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  domicilioContainer: {
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
  },
  switchRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: SPACING.sm,
  },
  fieldContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.medium,
    fontWeight: '600' as const,
    marginBottom: SPACING.xs,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
  textarea: {
    minHeight: 60,
    maxHeight: 200,
  },
  selectorButton: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  selectorText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
  saldoContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  saldoText: {
    fontSize: FONTS.medium,
    color: COLORS.text,
  },
});
