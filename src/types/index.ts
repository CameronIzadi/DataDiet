export interface FoodItem {
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

export interface Meal {
  id: string;
  userId: string;
  imageUrl?: string;
  loggedAt: Date;
  foods: FoodItem[];
  nutrition?: Nutrition;
  flags: string[];
  metadata?: {
    location?: string;
    source: 'phone_photo' | 'gallery' | 'manual';
  };
}

export interface BloodWork {
  id: string;
  userId: string;
  testDate: Date;
  results: {
    totalCholesterol?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    fastingGlucose?: number;
  };
  notes?: string;
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

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  preferences?: {
    notifications: boolean;
    timezone: string;
  };
}
