import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Cargando...', 
  fullScreen = false 
}) => {
  const containerStyle = fullScreen ? styles.fullScreen : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size="large" color="#6200ee" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
