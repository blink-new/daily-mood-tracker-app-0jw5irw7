import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

interface MoodEntryProps {
  selectedMood: number | null;
  journalText: string;
  onJournalChange: (text: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const MOOD_OPTIONS = [
  { emoji: '😢', score: 1, label: 'Very Sad' },
  { emoji: '😔', score: 2, label: 'Sad' },
  { emoji: '😐', score: 3, label: 'Neutral' },
  { emoji: '😊', score: 4, label: 'Happy' },
  { emoji: '😄', score: 5, label: 'Very Happy' },
];

export function MoodEntry({
  selectedMood,
  journalText,
  onJournalChange,
  onSubmit,
  onCancel,
  isSubmitting
}: MoodEntryProps) {
  const selectedMoodData = MOOD_OPTIONS.find(m => m.score === selectedMood);

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <BlurView intensity={20} style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <Animated.View 
            style={styles.modal}
            entering={SlideInUp.duration(400)}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.modalContent}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>How are you feeling?</Text>
                <TouchableOpacity 
                  onPress={onSubmit} 
                  style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Selected Mood Display */}
              {selectedMoodData && (
                <Animated.View 
                  style={styles.selectedMoodContainer}
                  entering={FadeIn.duration(300)}
                >
                  <Text style={styles.selectedMoodEmoji}>{selectedMoodData.emoji}</Text>
                  <Text style={styles.selectedMoodLabel}>{selectedMoodData.label}</Text>
                </Animated.View>
              )}

              {/* Journal Entry */}
              <View style={styles.journalContainer}>
                <Text style={styles.journalLabel}>
                  What's on your mind? (Optional)
                </Text>
                <TextInput
                  style={styles.journalInput}
                  placeholder="Share your thoughts, feelings, or what happened today..."
                  placeholderTextColor="#9CA3AF"
                  value={journalText}
                  onChangeText={onJournalChange}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <Text style={styles.characterCount}>
                  {journalText.length}/500
                </Text>
              </View>

              {/* AI Reflection Info */}
              <View style={styles.aiInfo}>
                <Text style={styles.aiInfoText}>
                  ✨ Our AI will provide a personalized reflection based on your mood and journal entry
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedMoodContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  selectedMoodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  selectedMoodLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  journalContainer: {
    marginBottom: 20,
  },
  journalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  journalInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
  },
  aiInfo: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  aiInfoText: {
    color: '#4338CA',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});