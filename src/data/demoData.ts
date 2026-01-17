// Demo data for demonstration purposes
// 18 meals over 6 days with a compelling narrative

import { Meal, BloodWork } from '@/types';

export const DEMO_MEALS: Meal[] = [
  {
    id: 'meal_001',
    loggedAt: new Date('2025-01-02T08:15:00Z'),
    foods: [
      { name: 'Scrambled eggs', portion: '2 eggs' },
      { name: 'Toast', portion: '2 slices' },
      { name: 'Orange juice', portion: '8 oz', container: 'plastic_bottle' }
    ],
    flags: ['plastic_bottle']
  },
  {
    id: 'meal_002',
    loggedAt: new Date('2025-01-02T12:30:00Z'),
    foods: [
      { name: 'Turkey sandwich', portion: '1 sandwich' },
      { name: 'Chips', portion: '1 bag' },
      { name: 'Bottled water', portion: '16 oz', container: 'plastic_bottle' }
    ],
    flags: ['plastic_bottle']
  },
  {
    id: 'meal_003',
    loggedAt: new Date('2025-01-02T21:45:00Z'),
    foods: [
      { name: 'Pepperoni pizza', portion: '3 slices' },
      { name: 'Soda', portion: '12 oz', container: 'plastic_bottle' }
    ],
    flags: ['late_meal', 'processed_meat', 'plastic_bottle']
  },
  {
    id: 'meal_004',
    loggedAt: new Date('2025-01-03T07:30:00Z'),
    foods: [
      { name: 'Bacon', portion: '4 strips' },
      { name: 'Pancakes', portion: '3 pancakes' },
      { name: 'Coffee', portion: '12 oz' }
    ],
    flags: ['processed_meat']
  },
  {
    id: 'meal_005',
    loggedAt: new Date('2025-01-03T13:00:00Z'),
    foods: [
      { name: 'Caesar salad', portion: '1 bowl' },
      { name: 'Grilled chicken', portion: '4 oz' },
      { name: 'Iced tea', portion: '16 oz', container: 'plastic_bottle' }
    ],
    flags: ['plastic_bottle']
  },
  {
    id: 'meal_006',
    loggedAt: new Date('2025-01-03T22:00:00Z'),
    foods: [
      { name: 'Burger', portion: '1 burger' },
      { name: 'French fries', portion: 'large' },
      { name: 'Milkshake', portion: '16 oz' }
    ],
    flags: ['late_meal', 'high_sodium']
  },
  {
    id: 'meal_007',
    loggedAt: new Date('2025-01-04T09:00:00Z'),
    foods: [
      { name: 'Oatmeal', portion: '1 bowl' },
      { name: 'Banana', portion: '1 medium' },
      { name: 'Green tea', portion: '8 oz' }
    ],
    flags: []
  },
  {
    id: 'meal_008',
    loggedAt: new Date('2025-01-04T12:15:00Z'),
    foods: [
      { name: 'Hot dog', portion: '2 hot dogs' },
      { name: 'Coleslaw', portion: '1 cup' },
      { name: 'Lemonade', portion: '12 oz', container: 'plastic_bottle' }
    ],
    flags: ['processed_meat', 'plastic_bottle']
  },
  {
    id: 'meal_009',
    loggedAt: new Date('2025-01-04T19:30:00Z'),
    foods: [
      { name: 'Grilled salmon', portion: '6 oz' },
      { name: 'Steamed broccoli', portion: '1 cup' },
      { name: 'Brown rice', portion: '1 cup' },
      { name: 'Water', portion: '12 oz', container: 'glass' }
    ],
    flags: []
  },
  {
    id: 'meal_010',
    loggedAt: new Date('2025-01-05T08:00:00Z'),
    foods: [
      { name: 'Greek yogurt', portion: '1 cup' },
      { name: 'Granola', portion: '1/2 cup' },
      { name: 'Berries', portion: '1/2 cup' }
    ],
    flags: []
  },
  {
    id: 'meal_011',
    loggedAt: new Date('2025-01-05T13:30:00Z'),
    foods: [
      { name: 'Ham sandwich', portion: '1 sandwich' },
      { name: 'Apple', portion: '1 medium' },
      { name: 'Bottled water', portion: '16 oz', container: 'plastic_bottle' }
    ],
    flags: ['processed_meat', 'plastic_bottle']
  },
  {
    id: 'meal_012',
    loggedAt: new Date('2025-01-05T21:30:00Z'),
    foods: [
      { name: 'Pasta with meat sauce', portion: '2 cups' },
      { name: 'Garlic bread', portion: '2 slices' },
      { name: 'Red wine', portion: '5 oz' }
    ],
    flags: ['late_meal']
  },
  {
    id: 'meal_013',
    loggedAt: new Date('2025-01-06T10:00:00Z'),
    foods: [
      { name: 'Breakfast burrito', portion: '1 large' },
      { name: 'Salsa', portion: '2 tbsp' },
      { name: 'Orange juice', portion: '8 oz', container: 'plastic_bottle' }
    ],
    flags: ['plastic_bottle']
  },
  {
    id: 'meal_014',
    loggedAt: new Date('2025-01-06T14:00:00Z'),
    foods: [
      { name: 'Sushi roll', portion: '8 pieces' },
      { name: 'Miso soup', portion: '1 bowl' },
      { name: 'Green tea', portion: '8 oz' }
    ],
    flags: []
  },
  {
    id: 'meal_015',
    loggedAt: new Date('2025-01-06T20:00:00Z'),
    foods: [
      { name: 'Steak', portion: '8 oz' },
      { name: 'Baked potato', portion: '1 large' },
      { name: 'Caesar salad', portion: '1 side' }
    ],
    flags: []
  },
  {
    id: 'meal_016',
    loggedAt: new Date('2025-01-07T07:45:00Z'),
    foods: [
      { name: 'Sausage links', portion: '3 links' },
      { name: 'Hash browns', portion: '1 cup' },
      { name: 'Coffee', portion: '12 oz' }
    ],
    flags: ['processed_meat']
  },
  {
    id: 'meal_017',
    loggedAt: new Date('2025-01-07T12:00:00Z'),
    foods: [
      { name: 'Chicken wrap', portion: '1 wrap' },
      { name: 'Side salad', portion: '1 small' },
      { name: 'Diet soda', portion: '12 oz', container: 'plastic_bottle' }
    ],
    flags: ['plastic_bottle']
  },
  {
    id: 'meal_018',
    loggedAt: new Date('2025-01-07T22:15:00Z'),
    foods: [
      { name: 'Frozen pizza', portion: '4 slices' },
      { name: 'Beer', portion: '12 oz' }
    ],
    flags: ['late_meal', 'ultra_processed']
  }
];

export const DEMO_BLOOD_WORK: BloodWork = {
  id: 'blood_001',
  testDate: new Date('2025-01-10'),
  totalCholesterol: 242,
  ldl: 158,
  hdl: 42,
  triglycerides: 210,
  fastingGlucose: 108
};

// Summary stats for the demo data
export const DEMO_SUMMARY = {
  totalMeals: 18,
  dateRange: 'Jan 2 - Jan 7, 2025',
  plasticBottleCount: 10,
  processedMeatCount: 6,
  lateMealsCount: 5,
  lateMealPercentage: 27.8,
  averageDinnerTime: '9:06 PM'
};

