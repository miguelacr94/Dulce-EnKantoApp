import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const TailwindExample: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center bg-background p-4">
      <View className="bg-cardBackground rounded-lg shadow-lg p-6 mb-4 w-full max-w-sm">
        <Text className="text-primary text-xl font-bold mb-2 text-center">
          ¡Tailwind CSS Configurado!
        </Text>
        <Text className="text-textLight text-center mb-4">
          Este es un ejemplo de componente usando Tailwind CSS en React Native
        </Text>
        <View className="flex-row gap-2">
          <TouchableOpacity className="bg-primary rounded-lg px-4 py-2 flex-1">
            <Text className="text-white font-semibold text-center">
              Primario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-secondary rounded-lg px-4 py-2 flex-1">
            <Text className="text-white font-semibold text-center">
              Secundario
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="bg-cardBackground rounded-lg shadow-md p-4 w-full max-w-sm">
        <Text className="text-text font-semibold mb-2">Colores disponibles:</Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-primary rounded mr-2" />
            <Text className="text-text">Primary</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-secondary rounded mr-2" />
            <Text className="text-text">Secondary</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-accent rounded mr-2" />
            <Text className="text-text">Accent</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-success rounded mr-2" />
            <Text className="text-text">Success</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-error rounded mr-2" />
            <Text className="text-text">Error</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
