import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Meal, Insights } from '../types';
import { getMeals } from '../services/meals';
import { calculateInsights } from '../services/insights';

interface Props {
  navigation: any;
}

interface InsightCardProps {
  icon: string;
  title: string;
  value: string;
  context: string;
  concernLevel: 'low' | 'moderate' | 'elevated';
}

function InsightCard({ icon, title, value, context, concernLevel }: InsightCardProps) {
  const borderColor =
    concernLevel === 'elevated' ? '#F85149' :
    concernLevel === 'moderate' ? '#D29922' : '#238636';

  return (
    <View style={[styles.card, { borderLeftColor: borderColor }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardContext}>{context}</Text>
    </View>
  );
}

export default function InsightsScreen({ navigation }: Props) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const meals = await getMeals('demo_user');
      const calculatedInsights = calculateInsights(meals);
      setInsights(calculatedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#4A90A4" />
      </SafeAreaView>
    );
  }

  if (!insights || insights.totalMeals === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Insights</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>No data yet</Text>
          <Text style={styles.emptySubtext}>Log some meals to see your patterns</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{insights.totalMeals} meals logged</Text>
          <Text style={styles.summarySubtitle}>{insights.dateRange}</Text>
        </View>

        <InsightCard
          icon="🥤"
          title="Plastic Exposure"
          value={`${insights.plastic.count} bottles (${insights.plastic.perDay.toFixed(1)}/day)`}
          context="Microplastics are linked to endocrine disruption. Consider reusable bottles."
          concernLevel={insights.plastic.concernLevel}
        />

        <InsightCard
          icon="🥓"
          title="Processed Meat"
          value={`${insights.processedMeat.perWeek.toFixed(1)} servings/week`}
          context="WHO classifies processed meat as Group 1 carcinogen. Recommended: <3/week."
          concernLevel={insights.processedMeat.concernLevel}
        />

        <InsightCard
          icon="🌙"
          title="Late Meals"
          value={`${insights.mealTiming.lateMealPercent}% after 9pm`}
          context="Late eating is associated with disrupted sleep and metabolic issues."
          concernLevel={insights.mealTiming.concernLevel}
        />

        <InsightCard
          icon="⏰"
          title="Meal Timing"
          value={`Avg dinner: ${insights.mealTiming.avgDinnerTime}`}
          context="Earlier dinners (before 8pm) are associated with better metabolic health."
          concernLevel={insights.mealTiming.concernLevel}
        />

        <View style={styles.patternCard}>
          <Text style={styles.patternTitle}>Patterns</Text>
          <View style={styles.patternRow}>
            <Text style={styles.patternLabel}>Busiest day:</Text>
            <Text style={styles.patternValue}>{insights.patterns.busiestDay}</Text>
          </View>
          <View style={styles.patternRow}>
            <Text style={styles.patternLabel}>Weekend vs Weekday:</Text>
            <Text style={styles.patternValue}>{insights.patterns.weekendVsWeekday}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => navigation.navigate('Report')}
        >
          <Text style={styles.reportButtonText}>📄 Generate Doctor Report</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    color: '#58A6FF',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 20,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#8B949E',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B949E',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardContext: {
    fontSize: 14,
    color: '#8B949E',
    lineHeight: 20,
  },
  patternCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  patternTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patternLabel: {
    fontSize: 14,
    color: '#8B949E',
  },
  patternValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  reportButton: {
    backgroundColor: '#238636',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B949E',
  },
  spacer: {
    height: 40,
  },
});
