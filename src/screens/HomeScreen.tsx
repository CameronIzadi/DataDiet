import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { Meal } from '../types';
import { getRecentMeals } from '../services/meals';

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const recentMeals = await getRecentMeals('demo_user', 10);
      setMeals(recentMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMealItem = ({ item }: { item: Meal }) => (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTime}>
          {new Date(item.loggedAt).toLocaleDateString()} at{' '}
          {new Date(item.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <View style={styles.flagsContainer}>
          {item.flags.includes('plastic_bottle') && <Text style={styles.flag}>🥤</Text>}
          {item.flags.includes('processed_meat') && <Text style={styles.flag}>🥓</Text>}
          {item.flags.includes('late_meal') && <Text style={styles.flag}>🌙</Text>}
        </View>
      </View>
      <Text style={styles.mealFoods}>
        {item.foods.map(f => f.name).join(', ')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DataDiet</Text>
        <Text style={styles.subtitle}>Your dietary black box</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => navigation.navigate('Capture')}
        >
          <Text style={styles.captureButtonText}>📸 Log Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.insightsButton}
          onPress={() => navigation.navigate('Insights')}
        >
          <Text style={styles.insightsButtonText}>📊 Insights</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Meals</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4A90A4" />
        ) : meals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals logged yet</Text>
            <Text style={styles.emptySubtext}>Tap "Log Meal" to get started</Text>
          </View>
        ) : (
          <FlatList
            data={meals}
            renderItem={renderMealItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8B949E',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  captureButton: {
    flex: 1,
    backgroundColor: '#238636',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  insightsButton: {
    flex: 1,
    backgroundColor: '#21262D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#30363D',
  },
  insightsButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  recentSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#161B22',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 14,
    color: '#8B949E',
  },
  flagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  flag: {
    fontSize: 16,
  },
  mealFoods: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#8B949E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6E7681',
  },
});
