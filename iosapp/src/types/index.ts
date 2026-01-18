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
  status?: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
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

export type ConcernLevel = 'low' | 'moderate' | 'elevated';

export interface SignalInsight {
  count: number;
  perDay?: number;
  perWeek?: number;
  percent?: number;
  lateCount?: number; // For caffeine after 2pm
  concernLevel: ConcernLevel;
}

export interface Insights {
  totalMeals: number;
  dateRange: string;
  daysTracked: number;

  // All signal-based insights (personalized based on user selection)
  plastic: SignalInsight;
  plasticHot: SignalInsight;
  processedMeat: SignalInsight;
  charredGrilled: SignalInsight;
  ultraProcessed: SignalInsight;
  highSugarBeverage: SignalInsight;
  caffeine: SignalInsight & { lateCount: number }; // Caffeine after 2pm
  alcohol: SignalInsight;
  friedFood: SignalInsight;
  refinedGrain: SignalInsight;
  highSodium: SignalInsight;
  spicyIrritant: SignalInsight;
  acidicTrigger: SignalInsight;
  lateMeal: SignalInsight & { avgDinnerTime: string };

  // Patterns
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
