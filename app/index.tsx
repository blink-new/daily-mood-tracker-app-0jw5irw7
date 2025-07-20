import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { blink } from '@/lib/blink';
import { MoodChart } from '@/components/MoodChart';
import { MoodEntry } from '@/components/MoodEntry';
import { AIReflection } from '@/components/AIReflection';

const { width } = Dimensions.get('window');

interface MoodData {
  id: string;
  mood_emoji: string;
  mood_score: number;
  journal_entry?: string;
  ai_reflection?: string;
  created_at: string;
}

const MOOD_OPTIONS = [
  { emoji: '😢', score: 1, label: 'Very Sad' },
  { emoji: '😔', score: 2, label: 'Sad' },
  { emoji: '😐', score: 3, label: 'Neutral' },
  { emoji: '😊', score: 4, label: 'Happy' },
  { emoji: '😄', score: 5, label: 'Very Happy' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [moodEntries, setMoodEntries] = useState<MoodData[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalText, setJournalText] = useState('');
  const [showMoodEntry, setShowMoodEntry] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scaleValue = useSharedValue(1);

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user);
      setLoading(state.isLoading);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      loadMoodEntries();
    }
  }, [user]);

  const loadMoodEntries = async () => {
    try {
      console.log('Loading mood entries for user:', user.id);
      const entries = await blink.db.mood_entries.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        limit: 7
      });
      console.log('Loaded entries:', entries.length, entries);
      setMoodEntries(entries);
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  };

  const handleMoodSelect = (moodScore: number) => {
    setSelectedMood(moodScore);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate selection
    scaleValue.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const generateAIReflection = async (mood: number, journal: string) => {
    try {
      const moodLabel = MOOD_OPTIONS.find(m => m.score === mood)?.label || 'neutral';
      const prompt = `Based on this mood entry: "${journal}" and mood level: ${moodLabel}, provide a short, encouraging reflection or inspirational quote (2-3 sentences max) that promotes mental wellness and positivity.`;
      
      const { text } = await blink.ai.generateText({
        prompt,
        maxTokens: 100
      });
      
      return text;
    } catch (error) {
      console.error('Error generating AI reflection:', error);
      return "Remember, every day is a new opportunity to grow and find joy in small moments. You're doing great! 🌟";
    }
  };

  const submitMoodEntry = async () => {
    if (!selectedMood) return;
    
    setIsSubmitting(true);
    try {
      // Generate AI reflection
      const aiReflection = await generateAIReflection(selectedMood, journalText);
      
      // Save to database
      const newEntry = await blink.db.mood_entries.create({
        user_id: user.id,
        mood_emoji: MOOD_OPTIONS.find(m => m.score === selectedMood)?.emoji || '😐',
        mood_score: selectedMood,
        journal_entry: journalText || null,
        ai_reflection: aiReflection,
        created_at: new Date().toISOString()
      });

      // Reload entries from database to ensure fresh data
      await loadMoodEntries();
      
      // Reset form
      setSelectedMood(null);
      setJournalText('');
      setShowMoodEntry(false);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Mood Logged!', 'Your mood has been saved with AI reflection.');
      
    } catch (error) {
      console.error('Error submitting mood:', error);
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  if (loading) {
    return (
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.container}
      >
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Please sign in to track your mood</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => blink.auth.login()}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6']}
      style={styles.container}
    >
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(600)}
        >
          <Text style={styles.greeting}>Hello, {user.email?.split('@')[0]}!</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </Animated.View>

        {/* Quick Mood Entry */}
        <Animated.View 
          style={styles.quickMoodCard}
          entering={FadeInUp.duration(600).delay(200)}
        >
          <Text style={styles.cardTitle}>Log Your Mood</Text>
          <View style={styles.moodSelector}>
            {MOOD_OPTIONS.map((mood) => (
              <TouchableOpacity
                key={mood.score}
                style={[
                  styles.moodOption,
                  selectedMood === mood.score && styles.selectedMoodOption
                ]}
                onPress={() => handleMoodSelect(mood.score)}
              >
                <Animated.Text 
                  style={[
                    styles.moodEmoji,
                    selectedMood === mood.score && animatedStyle
                  ]}
                >
                  {mood.emoji}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedMood && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => setShowMoodEntry(true)}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Mood Chart - Temporarily disabled for debugging */}
        {moodEntries.length > 0 && (
          <Animated.View 
            style={styles.chartCard}
            entering={FadeInUp.duration(600).delay(400)}
          >
            <Text style={styles.cardTitle}>7-Day Mood Trend</Text>
            <Text style={styles.chartPlaceholder}>Chart coming soon...</Text>
          </Animated.View>
        )}

        {/* Recent Entries */}
        {moodEntries.length > 0 && (
          <Animated.View 
            style={styles.entriesCard}
            entering={FadeInUp.duration(600).delay(600)}
          >
            <Text style={styles.cardTitle}>Recent Entries</Text>
            {moodEntries.slice(0, 3).map((entry, index) => (
              <View key={entry.id} style={styles.entryItem}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryEmoji}>{entry.mood_emoji}</Text>
                  <Text style={styles.entryDate}>
                    {new Date(entry.created_at).toLocaleDateString()}
                  </Text>
                </View>
                {entry.journal_entry && (
                  <Text style={styles.entryText} numberOfLines={2}>
                    {entry.journal_entry}
                  </Text>
                )}
                {entry.ai_reflection && (
                  <AIReflection text={entry.ai_reflection} />
                )}
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>

      {/* Mood Entry Modal */}
      {showMoodEntry && (
        <MoodEntry
          selectedMood={selectedMood}
          journalText={journalText}
          onJournalChange={setJournalText}
          onSubmit={submitMoodEntry}
          onCancel={() => {
            setShowMoodEntry(false);
            setSelectedMood(null);
            setJournalText('');
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  signInButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greeting: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
  },
  subtitle: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '400',
  },
  quickMoodCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  moodOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodOption: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  moodEmoji: {
    fontSize: 24,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  entriesCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  entryItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryEmoji: {
    fontSize: 24,
  },
  entryDate: {
    color: '#6B7280',
    fontSize: 14,
  },
  entryText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  chartPlaceholder: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    fontStyle: 'italic',
    paddingVertical: 40,
  },
});