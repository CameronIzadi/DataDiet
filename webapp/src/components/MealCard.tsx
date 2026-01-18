'use client';

import { Meal, MealFlag } from '@/types';
import { format, isToday, isYesterday } from 'date-fns';
import {
  Droplets,
  Moon,
  AlertTriangle,
  Beef,
  Package,
  Flame,
  Coffee,
  Wine,
  Wheat,
  Zap,
  CircleDot,
  Thermometer,
  ChevronRight,
  Utensils,
  Check
} from 'lucide-react';

interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
}

// Flag configuration with icons, labels, and colors
export const flagConfig: Record<MealFlag, { icon: typeof Droplets; label: string; color: string; bgColor: string; description: string }> = {
  plastic_bottle: {
    icon: Droplets,
    label: 'Plastic',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Potential microplastics/BPA exposure'
  },
  plastic_container_hot: {
    icon: Thermometer,
    label: 'Hot Plastic',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'Heat increases chemical leaching from plastic'
  },
  processed_meat: {
    icon: Beef,
    label: 'Processed Meat',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    description: 'WHO Group 1 carcinogen'
  },
  ultra_processed: {
    icon: Package,
    label: 'Ultra Processed',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Linked to obesity and chronic disease'
  },
  charred_grilled: {
    icon: Flame,
    label: 'Charred',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'May contain carcinogenic compounds'
  },
  fried: {
    icon: Zap,
    label: 'Fried',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    description: 'High in trans fats and inflammatory compounds'
  },
  high_sugar_beverage: {
    icon: Droplets,
    label: 'Sugary Drink',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30',
    description: 'Blood sugar spike, empty calories'
  },
  caffeine: {
    icon: Coffee,
    label: 'Caffeine',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'May affect sleep if consumed late'
  },
  alcohol: {
    icon: Wine,
    label: 'Alcohol',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Impacts liver, sleep, and calories'
  },
  high_sodium: {
    icon: AlertTriangle,
    label: 'High Sodium',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    description: 'May contribute to high blood pressure'
  },
  refined_grain: {
    icon: Wheat,
    label: 'Refined Grain',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Low fiber, rapid blood sugar impact'
  },
  spicy_irritant: {
    icon: Flame,
    label: 'Spicy',
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    description: 'May cause digestive irritation'
  },
  acidic_trigger: {
    icon: CircleDot,
    label: 'Acidic',
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-100 dark:bg-lime-900/30',
    description: 'May trigger acid reflux'
  },
  late_meal: {
    icon: Moon,
    label: 'Late Meal',
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    description: 'Eating after 9pm affects sleep & metabolism'
  },
};

export function MealCard({ meal, onClick }: MealCardProps) {
  const mealDate = new Date(meal.loggedAt);

  const getRelativeDate = () => {
    if (isToday(mealDate)) return 'Today';
    if (isYesterday(mealDate)) return 'Yesterday';
    return format(mealDate, 'EEE, MMM d');
  };

  // Get primary food name or combine if multiple
  const primaryFood = meal.foods.length > 0 ? meal.foods[0].name : 'Meal';
  const foodCount = meal.foods.length;
  const displayName = foodCount > 1 ? `${primaryFood} +${foodCount - 1}` : primaryFood;

  const timeString = format(mealDate, 'h:mm a');
  const hasFlags = meal.flags && meal.flags.length > 0;

  return (
    <div
      className={`group bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 transition-all duration-200 hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center p-3 gap-3">
        {/* Thumbnail */}
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={displayName}
            className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-warm-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
            <Utensils className="w-8 h-8 text-warm-400 dark:text-neutral-500" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 py-1">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-semibold text-warm-900 dark:text-white text-[15px] truncate">
              {displayName}
            </h3>
            <span className="text-xs text-warm-400 dark:text-neutral-500 flex-shrink-0">
              {timeString}
            </span>
          </div>

          {/* Date */}
          <p className="text-xs text-warm-500 dark:text-neutral-400 mb-2">
            {getRelativeDate()}
          </p>

          {/* Flags */}
          {hasFlags ? (
            <div className="flex flex-wrap gap-1">
              {meal.flags.slice(0, 3).map((flag, i) => {
                const config = flagConfig[flag];
                if (!config) return null;
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-medium"
                  >
                    {config.label}
                  </span>
                );
              })}
              {meal.flags.length > 3 && (
                <span className="text-[11px] text-warm-400 dark:text-neutral-500 ml-1">
                  +{meal.flags.length - 3}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">
                <Check className="w-3 h-3" />
                No flags
              </span>
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-warm-300 dark:text-neutral-600 flex-shrink-0" />
      </div>
    </div>
  );
}
