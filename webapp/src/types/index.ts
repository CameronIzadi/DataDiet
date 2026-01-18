// Core types for DataDiet

export interface Food {
  name: string;
  portion: string;
  container?: 'plastic_bottle' | 'glass' | 'can' | 'none';
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
}

export type MealFlag = 
  | 'plastic_bottle' 
  | 'plastic_container_hot'
  | 'processed_meat' 
  | 'ultra_processed'
  | 'charred_grilled'
  | 'fried'
  | 'high_sugar_beverage'
  | 'caffeine'
  | 'alcohol'
  | 'high_sodium'
  | 'refined_grain'
  | 'spicy_irritant'
  | 'acidic_trigger'
  | 'late_meal';

export interface Meal {
  id: string;
  loggedAt: Date;
  foods: Food[];
  flags: MealFlag[];
  imageUrl?: string;
  nutrition?: Nutrition;
}

export interface BloodWork {
  id: string;
  testDate: Date;
  totalCholesterol: number;
  ldl: number;
  hdl: number;
  triglycerides: number;
  fastingGlucose: number;
}

export interface BloodWorkStatus {
  totalCholesterol: 'normal' | 'borderline' | 'high';
  ldl: 'optimal' | 'near_optimal' | 'borderline' | 'high' | 'very_high';
  hdl: 'low' | 'normal' | 'high';
  triglycerides: 'normal' | 'borderline' | 'high' | 'very_high';
  fastingGlucose: 'normal' | 'borderline' | 'high';
}

export interface InsightMetric {
  value: number;
  label: string;
  context: string;
  concernLevel: 'low' | 'moderate' | 'elevated';
}

export interface Insights {
  totalMeals: number;
  dateRange: string;
  plastic: {
    count: number;
    perDay: number;
    concernLevel: 'low' | 'moderate' | 'elevated';
  };
  processedMeat: {
    count: number;
    perWeek: number;
    concernLevel: 'low' | 'moderate' | 'elevated';
  };
  mealTiming: {
    lateMealPercent: number;
    avgDinnerTime: string;
    concernLevel: 'low' | 'moderate' | 'elevated';
  };
  patterns: {
    busiestDay: string;
    weekendVsWeekday: string;
  };
}

export interface GeminiFoodAnalysis {
  foods: Food[];
  flags: MealFlag[];
  estimated_nutrition: Nutrition;
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

