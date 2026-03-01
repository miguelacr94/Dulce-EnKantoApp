import { View, Text, StyleSheet } from 'react-native';

interface EmptyStateProps {
  message?: string;
  submessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message = 'No hay datos para mostrar',
  submessage = 'Intenta crear un nuevo registro'
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>📭 {message}</Text>
      <Text style={styles.submessage}>{submessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  submessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
