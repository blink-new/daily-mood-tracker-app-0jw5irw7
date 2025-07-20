import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

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
    
    return {
      labels: last7Days.map(day => day.label),
      datasets: [{
        data: last7Days.map(day => day.score || 3), // Default to neutral if no entry
        color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
        strokeWidth: 3
      }]
    };
  };

  const chartData = prepareChartData();
  const chartWidth = width - 80; // Account for padding

  const chartConfig = {
    backgroundColor: '#FFFFFF',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#6366F1'
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#F3F4F6',
      strokeWidth: 1
    }
  };

  const getMoodEmoji = (score: number) => {
    switch (score) {
      case 1: return '😢';
      case 2: return '😔';
      case 3: return '😐';
      case 4: return '😊';
      case 5: return '😄';
      default: return '😐';
    }
  };

  const getAverageScore = () => {
    const validScores = chartData.datasets[0].data.filter(score => score > 0);
    if (validScores.length === 0) return 3;
    return Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length);
  };

  const averageScore = getAverageScore();

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={chartWidth}
        height={200}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        yAxisInterval={1}
        fromZero
        segments={4}
        yAxisSuffix=""
        yAxisLabel=""
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
      />
      
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Weekly Average</Text>
          <View style={styles.summaryValue}>
            <Text style={styles.summaryEmoji}>{getMoodEmoji(averageScore)}</Text>
            <Text style={styles.summaryScore}>{averageScore}/5</Text>
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
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