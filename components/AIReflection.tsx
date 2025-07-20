import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface AIReflectionProps {
  text: string;
}

export function AIReflection({ text }: AIReflectionProps) {
  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500)}
    >
      <View style={styles.header}>
        <Text style={styles.aiIcon}>✨</Text>
        <Text style={styles.aiLabel}>AI Reflection</Text>
      </View>
      <Text style={styles.reflectionText}>{text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  aiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionText: {
    fontSize: 14,
    color: '#0C4A6E',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});