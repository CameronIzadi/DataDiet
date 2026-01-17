import React, { createContext, useContext, useState, useCallback } from 'react';

export type TrackingGoal =
  | 'health_patterns'
  | 'doctor_tracking'
  | 'food_sensitivities'
  | 'curious';

// All available tracking signals the AI can detect
export type TrackingSignal =
  | 'plastic_container_hot'
  | 'plastic_bottle'
  | 'processed_meat'
  | 'charred_grilled'
  | 'ultra_processed'
  | 'high_sugar_beverage'
  | 'caffeine'
  | 'alcohol'
  | 'fried_food'
  | 'refined_grain'
  | 'high_sodium'
  | 'spicy_irritant'
  | 'acidic_trigger'
  | 'late_meal';

export const TRACKING_SIGNALS: { id: TrackingSignal; icon: string; label: string; description: string }[] = [
  { id: 'plastic_container_hot', icon: '🥡', label: 'Hot food in plastic', description: 'Detect meals in plastic containers' },
  { id: 'plastic_bottle', icon: '🍶', label: 'Plastic bottles', description: 'Track beverages in plastic' },
  { id: 'processed_meat', icon: '🥓', label: 'Processed meat', description: 'Bacon, sausage, deli meats' },
  { id: 'charred_grilled', icon: '🔥', label: 'Charred/grilled', description: 'Visible charring on food' },
  { id: 'ultra_processed', icon: '📦', label: 'Ultra-processed', description: 'Packaged & fast foods' },
  { id: 'high_sugar_beverage', icon: '🥤', label: 'Sugary drinks', description: 'Soda, sweetened beverages' },
  { id: 'caffeine', icon: '☕', label: 'Caffeine', description: 'Coffee, energy drinks, tea' },
  { id: 'alcohol', icon: '🍷', label: 'Alcohol', description: 'Beer, wine, spirits' },
  { id: 'fried_food', icon: '🍟', label: 'Fried food', description: 'Deep-fried items' },
  { id: 'refined_grain', icon: '🍞', label: 'Refined grains', description: 'White bread, pastries' },
  { id: 'high_sodium', icon: '🧂', label: 'High sodium', description: 'Estimated sodium > 1000mg' },
  { id: 'spicy_irritant', icon: '🌶️', label: 'Spicy foods', description: 'Gut irritant triggers' },
  { id: 'acidic_trigger', icon: '🍋', label: 'Acidic foods', description: 'Tomato, citrus-heavy' },
  { id: 'late_meal', icon: '🌙', label: 'Late meals', description: 'Eating after 9pm' },
];

interface OnboardingData {
  name: string;
  goal: TrackingGoal | null;
  trackingSignals: TrackingSignal[];
  trackEverything: boolean;
  cameraPermissionGranted: boolean;
}

interface OnboardingContextValue {
  data: OnboardingData;
  setField: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  setMultipleFields: (fields: Partial<OnboardingData>) => void;
  clearData: () => void;
  isComplete: boolean;
}

const initialData: OnboardingData = {
  name: '',
  goal: null,
  trackingSignals: [],
  trackEverything: true, // Default to tracking everything
  cameraPermissionGranted: false,
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);

  const setField = useCallback(<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const setMultipleFields = useCallback((fields: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...fields }));
  }, []);

  const clearData = useCallback(() => {
    setData(initialData);
  }, []);

  const isComplete = !!(data.name && data.goal);

  return (
    <OnboardingContext.Provider
      value={{
        data,
        setField,
        setMultipleFields,
        clearData,
        isComplete,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
