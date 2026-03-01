import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorViewProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ error, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>⚠️ {error}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
