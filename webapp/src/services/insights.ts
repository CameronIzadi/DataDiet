// Insights calculation service

import { Meal, Insights, BloodWork, BloodWorkStatus } from '@/types';
import { format, differenceInDays, parseISO } from 'date-fns';

/**
 * Calculate insights from meal data
 */
export function calculateInsights(meals: Meal[]): Insights {
  if (meals.length === 0) {
    return getEmptyInsights();
  }

  const totalMeals = meals.length;
  const sortedMeals = [...meals].sort((a, b) => 
    new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
  );
  
  const firstDate = new Date(sortedMeals[0].loggedAt);
  const lastDate = new Date(sortedMeals[sortedMeals.length - 1].loggedAt);
  const daySpan = Math.max(1, differenceInDays(lastDate, firstDate) + 1);

  // Plastic exposure
  const plasticMeals = meals.filter(m => m.flags.includes('plastic_bottle'));
  const plasticCount = plasticMeals.length;
  const plasticPerDay = plasticCount / daySpan;

  // Processed meat
  const processedMeatMeals = meals.filter(m => m.flags.includes('processed_meat'));
  const processedMeatCount = processedMeatMeals.length;
  const processedMeatPerWeek = (processedMeatCount / daySpan) * 7;

  // Late meals (after 9pm or before 5am)
  const lateMeals = meals.filter(m => {
    const hour = new Date(m.loggedAt).getHours();
    return hour >= 21 || hour < 5;
  });
  const lateMealPercent = Math.round((lateMeals.length / totalMeals) * 100);

  // Average dinner time (meals between 5pm and midnight)
  const dinnerMeals = meals.filter(m => {
    const hour = new Date(m.loggedAt).getHours();
    return hour >= 17;
  });
  
  let avgDinnerTime = 'N/A';
  if (dinnerMeals.length > 0) {
    const avgMinutes = dinnerMeals.reduce((sum, m) => {
      const date = new Date(m.loggedAt);
      return sum + date.getHours() * 60 + date.getMinutes();
    }, 0) / dinnerMeals.length;
    
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.round(avgMinutes % 60);
    avgDinnerTime = `${hours > 12 ? hours - 12 : hours}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  }

  // Day of week patterns
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCount = [0, 0, 0, 0, 0, 0, 0];
  meals.forEach(m => {
    dayCount[new Date(m.loggedAt).getDay()]++;
  });
  const busiestDayIndex = dayCount.indexOf(Math.max(...dayCount));

  // Weekend vs weekday analysis
  const weekendMeals = meals.filter(m => {
    const day = new Date(m.loggedAt).getDay();
    return day === 0 || day === 6;
  });
  const weekendLateMeals = weekendMeals.filter(m => {
    const hour = new Date(m.loggedAt).getHours();
    return hour >= 21;
  });
  const weekendLatePercent = weekendMeals.length > 0 
    ? Math.round((weekendLateMeals.length / weekendMeals.length) * 100)
    : 0;

  return {
    totalMeals,
    dateRange: `${format(firstDate, 'MMM d')} - ${format(lastDate, 'MMM d, yyyy')}`,
    plastic: {
      count: plasticCount,
      perDay: plasticPerDay,
      concernLevel: plasticCount > 10 ? 'elevated' : plasticCount > 5 ? 'moderate' : 'low',
    },
    processedMeat: {
      count: processedMeatCount,
      perWeek: processedMeatPerWeek,
      concernLevel: processedMeatPerWeek > 4 ? 'elevated' : processedMeatPerWeek > 2 ? 'moderate' : 'low',
    },
    mealTiming: {
      lateMealPercent,
      avgDinnerTime,
      concernLevel: lateMealPercent > 30 ? 'elevated' : lateMealPercent > 15 ? 'moderate' : 'low',
    },
    patterns: {
      busiestDay: dayNames[busiestDayIndex],
      weekendVsWeekday: weekendLatePercent > 30 
        ? 'Late meals cluster on weekends' 
        : 'Consistent timing across week',
    },
  };
}

/**
 * Get empty insights for when no data exists
 */
function getEmptyInsights(): Insights {
  return {
    totalMeals: 0,
    dateRange: 'No data',
    plastic: { count: 0, perDay: 0, concernLevel: 'low' },
    processedMeat: { count: 0, perWeek: 0, concernLevel: 'low' },
    mealTiming: { lateMealPercent: 0, avgDinnerTime: 'N/A', concernLevel: 'low' },
    patterns: { busiestDay: 'N/A', weekendVsWeekday: 'No data' },
  };
}

/**
 * Analyze blood work results
 */
export function analyzeBloodWork(bloodWork: BloodWork): BloodWorkStatus {
  return {
    totalCholesterol: bloodWork.totalCholesterol < 200 ? 'normal' 
      : bloodWork.totalCholesterol < 240 ? 'borderline' : 'high',
    ldl: bloodWork.ldl < 100 ? 'optimal'
      : bloodWork.ldl < 130 ? 'near_optimal'
      : bloodWork.ldl < 160 ? 'borderline'
      : bloodWork.ldl < 190 ? 'high' : 'very_high',
    hdl: bloodWork.hdl < 40 ? 'low' : bloodWork.hdl > 60 ? 'high' : 'normal',
    triglycerides: bloodWork.triglycerides < 150 ? 'normal'
      : bloodWork.triglycerides < 200 ? 'borderline'
      : bloodWork.triglycerides < 500 ? 'high' : 'very_high',
    fastingGlucose: bloodWork.fastingGlucose < 100 ? 'normal'
      : bloodWork.fastingGlucose < 126 ? 'borderline' : 'high',
  };
}

/**
 * Generate potential correlations between diet and blood work
 */
export function generateCorrelations(insights: Insights, bloodWork: BloodWork): string[] {
  const correlations: string[] = [];
  const status = analyzeBloodWork(bloodWork);

  // LDL correlations
  if (status.ldl === 'high' || status.ldl === 'very_high' || status.ldl === 'borderline') {
    if (insights.processedMeat.concernLevel !== 'low') {
      correlations.push(
        `Elevated LDL (${bloodWork.ldl} mg/dL) may correlate with processed meat consumption (${insights.processedMeat.perWeek.toFixed(1)} servings/week)`
      );
    }
  }

  // Triglyceride correlations
  if (status.triglycerides === 'high' || status.triglycerides === 'borderline') {
    if (insights.mealTiming.concernLevel !== 'low') {
      correlations.push(
        `Elevated triglycerides (${bloodWork.triglycerides} mg/dL) may be associated with late-night eating pattern (${insights.mealTiming.lateMealPercent}% of meals after 9pm)`
      );
    }
  }

  // HDL correlations
  if (status.hdl === 'low') {
    correlations.push(
      `Low HDL (${bloodWork.hdl} mg/dL) - consider dietary modifications to increase healthy fats`
    );
  }

  // Glucose correlations
  if (status.fastingGlucose === 'borderline' || status.fastingGlucose === 'high') {
    if (insights.mealTiming.lateMealPercent > 20) {
      correlations.push(
        `Borderline glucose (${bloodWork.fastingGlucose} mg/dL) may be influenced by meal timing patterns`
      );
    }
  }

  return correlations;
}

/**
 * Get meal timing distribution for visualization
 */
export function getMealTimingDistribution(meals: Meal[]): { label: string; percent: number }[] {
  const morning = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 6 && h < 11;
  }).length;

  const midday = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 11 && h < 15;
  }).length;

  const evening = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 15 && h < 21;
  }).length;

  const late = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 21 || h < 6;
  }).length;

  const total = meals.length || 1;

  return [
    { label: 'Morning (6am-11am)', percent: Math.round((morning / total) * 100) },
    { label: 'Midday (11am-3pm)', percent: Math.round((midday / total) * 100) },
    { label: 'Evening (3pm-9pm)', percent: Math.round((evening / total) * 100) },
    { label: 'Late (9pm+)', percent: Math.round((late / total) * 100) },
  ];
}

/**
 * Get weekly flag trend data for area chart
 * Shows daily flag counts over the past 2-4 weeks
 */
export interface WeeklyTrendData {
  date: string;
  dateShort: string;
  total: number;
  processed: number;
  timing: number;
  plastic: number;
}

export function getWeeklyFlagTrend(meals: Meal[]): WeeklyTrendData[] {
  if (meals.length === 0) return [];

  // Group meals by date
  const mealsByDate = new Map<string, Meal[]>();

  meals.forEach(meal => {
    const date = format(new Date(meal.loggedAt), 'yyyy-MM-dd');
    if (!mealsByDate.has(date)) {
      mealsByDate.set(date, []);
    }
    mealsByDate.get(date)!.push(meal);
  });

  // Sort dates and take last 28 days max
  const sortedDates = Array.from(mealsByDate.keys()).sort();
  const recentDates = sortedDates.slice(-28);

  return recentDates.map(date => {
    const dayMeals = mealsByDate.get(date) || [];

    const processed = dayMeals.filter(m =>
      m.flags.includes('processed_meat') || m.flags.includes('ultra_processed')
    ).length;

    const timing = dayMeals.filter(m =>
      m.flags.includes('late_meal') || m.flags.includes('caffeine')
    ).length;

    const plastic = dayMeals.filter(m =>
      m.flags.includes('plastic_bottle') || m.flags.includes('plastic_container_hot')
    ).length;

    const total = processed + timing + plastic;

    return {
      date,
      dateShort: format(parseISO(date), 'MMM d'),
      total,
      processed,
      timing,
      plastic,
    };
  });
}

/**
 * Get flag distribution data for donut chart
 * Shows frequency of each flag type
 */
export interface FlagDistributionData {
  name: string;
  value: number;
  flag: string;
  [key: string]: string | number;
}

export function getFlagDistribution(meals: Meal[]): FlagDistributionData[] {
  if (meals.length === 0) return [];

  const flagLabels: Record<string, string> = {
    processed_meat: 'Processed Meat',
    ultra_processed: 'Ultra-Processed',
    charred_grilled: 'Charred/Grilled',
    fried: 'Fried Foods',
    late_meal: 'Late Meals',
    caffeine: 'Caffeine',
    plastic_bottle: 'Plastic Bottles',
    plastic_container_hot: 'Hot Plastic',
    high_sugar_beverage: 'Sugary Drinks',
    alcohol: 'Alcohol',
    high_sodium: 'High Sodium',
    refined_grain: 'Refined Grains',
    spicy_irritant: 'Spicy Foods',
    acidic_trigger: 'Acidic Foods',
  };

  // Count each flag
  const flagCounts = new Map<string, number>();

  meals.forEach(meal => {
    meal.flags.forEach(flag => {
      flagCounts.set(flag, (flagCounts.get(flag) || 0) + 1);
    });
  });

  // Convert to array and sort by count
  const distribution = Array.from(flagCounts.entries())
    .map(([flag, value]) => ({
      name: flagLabels[flag] || flag,
      value,
      flag,
    }))
    .sort((a, b) => b.value - a.value);

  // Take top 6 and group rest as "Other"
  if (distribution.length > 6) {
    const top6 = distribution.slice(0, 6);
    const otherCount = distribution.slice(6).reduce((sum, item) => sum + item.value, 0);
    if (otherCount > 0) {
      top6.push({ name: 'Other', value: otherCount, flag: 'other' });
    }
    return top6;
  }

  return distribution;
}

/**
 * Get enhanced meal timing data comparing weekday vs weekend
 */
export interface EnhancedMealTimingData {
  slot: string;
  weekday: number;
  weekend: number;
  isDangerZone: boolean;
}

export function getEnhancedMealTiming(meals: Meal[]): EnhancedMealTimingData[] {
  if (meals.length === 0) return [];

  const slots = [
    { name: 'Early (5-8am)', start: 5, end: 8, danger: false },
    { name: 'Morning (8-11am)', start: 8, end: 11, danger: false },
    { name: 'Lunch (11am-2pm)', start: 11, end: 14, danger: false },
    { name: 'Afternoon (2-5pm)', start: 14, end: 17, danger: false },
    { name: 'Dinner (5-8pm)', start: 17, end: 20, danger: false },
    { name: 'Evening (8-9pm)', start: 20, end: 21, danger: false },
    { name: 'Late (9pm+)', start: 21, end: 24, danger: true },
  ];

  const weekdayMeals = meals.filter(m => {
    const day = new Date(m.loggedAt).getDay();
    return day >= 1 && day <= 5;
  });

  const weekendMeals = meals.filter(m => {
    const day = new Date(m.loggedAt).getDay();
    return day === 0 || day === 6;
  });

  const countMealsInSlot = (mealList: Meal[], start: number, end: number) => {
    return mealList.filter(m => {
      const hour = new Date(m.loggedAt).getHours();
      if (start === 21 && end === 24) {
        // Late slot includes 9pm to midnight and early morning
        return hour >= 21 || hour < 5;
      }
      return hour >= start && hour < end;
    }).length;
  };

  return slots.map(slot => ({
    slot: slot.name,
    weekday: countMealsInSlot(weekdayMeals, slot.start, slot.end),
    weekend: countMealsInSlot(weekendMeals, slot.start, slot.end),
    isDangerZone: slot.danger,
  }));
}

/**
 * Get nutrition balance data for radar chart
 * Only returns data if meals have nutrition info
 */
export interface NutritionBalanceData {
  metric: string;
  value: number;
  fullMark: number;
}

export function getNutritionBalance(meals: Meal[]): NutritionBalanceData[] | null {
  // Filter meals that have nutrition data
  const mealsWithNutrition = meals.filter(m => m.nutrition);

  // Need at least 3 meals with nutrition data
  if (mealsWithNutrition.length < 3) return null;

  // Calculate averages
  const totals = mealsWithNutrition.reduce(
    (acc, meal) => {
      if (meal.nutrition) {
        acc.protein += meal.nutrition.protein;
        acc.carbs += meal.nutrition.carbs;
        acc.fat += meal.nutrition.fat;
        acc.sodium += meal.nutrition.sodium;
        acc.calories += meal.nutrition.calories;
      }
      return acc;
    },
    { protein: 0, carbs: 0, fat: 0, sodium: 0, calories: 0 }
  );

  const count = mealsWithNutrition.length;

  // Normalize values to 0-100 scale based on daily recommended values
  // Using per-meal targets (assuming 3 meals/day)
  const normalize = (value: number, dailyTarget: number) => {
    const perMealTarget = dailyTarget / 3;
    const avgPerMeal = value / count;
    // Scale so 100% of target = 80 on chart, allowing overages
    return Math.min(100, (avgPerMeal / perMealTarget) * 80);
  };

  return [
    { metric: 'Protein', value: normalize(totals.protein, 50), fullMark: 100 },
    { metric: 'Carbs', value: normalize(totals.carbs, 275), fullMark: 100 },
    { metric: 'Fat', value: normalize(totals.fat, 65), fullMark: 100 },
    { metric: 'Sodium', value: normalize(totals.sodium, 2300), fullMark: 100 },
  ];
}

