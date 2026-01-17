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

