import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MoodData {
  id: string;
  mood_score: number;
  created_at: string;
}

interface MoodChartProps {
  data: MoodData[];
}

export function MoodChart({ data }: MoodChartProps) {
  // Prepare chart data for the last 7 days
  const prepareChartData = () => {
    const today = new Date();
    const last7Days = [];
    
    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        score: 0
      });
    }
    
    // Fill in actual mood scores
    data.forEach(entry => {
      const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
      const dayIndex = last7Days.findIndex(day => day.date === entryDate);
      if (dayIndex !== -1) {
        last7Days[dayIndex].score = entry.mood_score;
      }
    });
    
    return last7Days;
  };

  const chartData = prepareChartData();
  const chartWidth = width - 80; // Account for padding
  const chartHeight = 120;
  const maxScore = 5;

  const getMoodEmoji = (score: number) => {
    switch (score) {
      case 1: return '😢';
      case 2: return '😔';
      case 3: return '😐';
      case 4: return '😊';
      case 5: return '😄';
      default: return '⚪';
    }
  };

  const getMoodColor = (score: number) => {
    switch (score) {
      case 1: return '#EF4444'; // Red
      case 2: return '#F97316'; // Orange
      case 3: return '#EAB308'; // Yellow
      case 4: return '#22C55E'; // Green
      case 5: return '#10B981'; // Emerald
      default: return '#E5E7EB'; // Gray
    }
  };

  const getAverageScore = () => {
    const validScores = chartData.filter(day => day.score > 0).map(day => day.score);
    if (validScores.length === 0) return 0;
    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
  };

  const averageScore = getAverageScore();

  return (
    <View style={styles.container}>
      {/* Custom Bar Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {chartData.map((day, index) => {
            const barHeight = day.score > 0 ? (day.score / maxScore) * chartHeight : 8;
            const color = day.score > 0 ? getMoodColor(day.score) : '#E5E7EB';
            
            return (
              <Animated.View 
                key={index} 
                style={styles.barContainer}
                entering={FadeInUp.duration(600).delay(index * 100)}
              >
                {/* Mood emoji above bar */}
                {day.score > 0 && (
                  <Text style={styles.barEmoji}>{getMoodEmoji(day.score)}</Text>
                )}
                
                {/* Bar */}
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: barHeight, 
                        backgroundColor: color,
                        opacity: day.score > 0 ? 1 : 0.3
                      }
                    ]} 
                  />
                </View>
                
                {/* Day label */}
                <Text style={styles.dayLabel}>{day.label}</Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
      
      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Average</Text>
          <View style={styles.summaryValue}>
            {averageScore > 0 ? (
              <>
                <Text style={styles.summaryEmoji}>{getMoodEmoji(averageScore)}</Text>
                <Text style={styles.summaryScore}>{averageScore}/5</Text>
              </>
            ) : (
              <Text style={styles.summaryScore}>No data</Text>
            )}
          </View>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Entries This Week</Text>
          <Text style={styles.summaryNumber}>{data.length}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    width: '100%',
    alignItems: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    width: '100%',
    paddingHorizontal: 10,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barEmoji: {
    fontSize: 16,
    marginBottom: 4,
  },
  barWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
    minHeight: 8,
  },
  dayLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
  },
  summaryValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryEmoji: {
    fontSize: 20,
    marginRight: 5,
  },
  summaryScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
  },
});