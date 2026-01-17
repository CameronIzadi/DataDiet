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
  Thermometer
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MealCardProps {
  meal: Meal;
}

// Flag configuration with icons, labels, and colors - matching iOS app
const flagConfig: Record<MealFlag, { icon: typeof Droplets; label: string; color: string; bgColor: string }> = {
  plastic_bottle: { 
    icon: Droplets, 
    label: 'Plastic bottle', 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  plastic_container_hot: { 
    icon: Thermometer, 
    label: 'Hot food in plastic', 
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  processed_meat: { 
    icon: Beef, 
    label: 'Processed meat', 
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30'
  },
  ultra_processed: { 
    icon: Package, 
    label: 'Ultra processed', 
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30'
  },
  charred_grilled: { 
    icon: Flame, 
    label: 'Charred/Grilled', 
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  fried: { 
    icon: Zap, 
    label: 'Fried food', 
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  high_sugar_beverage: { 
    icon: Droplets, 
    label: 'High sugar beverage', 
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30'
  },
  caffeine: { 
    icon: Coffee, 
    label: 'Caffeine', 
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30'
  },
  alcohol: { 
    icon: Wine, 
    label: 'Alcohol', 
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  high_sodium: { 
    icon: AlertTriangle, 
    label: 'High sodium', 
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  refined_grain: { 
    icon: Wheat, 
    label: 'Refined grain', 
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30'
  },
  spicy_irritant: { 
    icon: Flame, 
    label: 'Spicy/Irritant', 
    color: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  acidic_trigger: { 
    icon: CircleDot, 
    label: 'Acidic trigger', 
    color: 'text-lime-600 dark:text-lime-400',
    bgColor: 'bg-lime-100 dark:bg-lime-900/30'
  },
  late_meal: { 
    icon: Moon, 
    label: 'Late meal (after 9pm)', 
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30'
  },
};

// Tooltip component with solid background
function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="relative group/tooltip">
      {children}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-3 py-2 rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl"
        style={{ 
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
        }}
      >
        <span className="text-xs font-medium">{label}</span>
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #1a1a1a',
          }}
        />
      </div>
    </div>
  );
}

export function MealCard({ meal }: MealCardProps) {
  const mealDate = new Date(meal.loggedAt);
  
  const getRelativeDate = () => {
    if (isToday(mealDate)) return 'Today';
    if (isYesterday(mealDate)) return 'Yesterday';
    return format(mealDate, 'EEE, MMM d');
  };

  const getMealType = () => {
    const hour = mealDate.getHours();
    if (hour < 11) return { label: 'Breakfast', icon: '☀️' };
    if (hour < 15) return { label: 'Lunch', icon: '🍽️' };
    if (hour < 18) return { label: 'Snack', icon: '🍎' };
    return { label: 'Dinner', icon: '🌙' };
  };

  const mealType = getMealType();
  const mainFoodName = meal.foods[0]?.name || 'Meal';

  return (
    <motion.div 
      className="group relative bg-white dark:bg-neutral-900 rounded-2xl transition-all duration-300"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
      }}
      whileHover={{ 
        y: -3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.08)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Left side - Time indicator */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warm-50 to-warm-100 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
              <span className="text-xl">{mealType.icon}</span>
            </div>
            <span className="text-[10px] font-medium text-warm-400 dark:text-neutral-500 uppercase tracking-wide">
              {mealType.label}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-warm-900 dark:text-white text-[17px] leading-snug mb-1">
                  {mainFoodName}
                </h3>
                <p className="text-sm text-warm-500 dark:text-neutral-400">
                  <span className="text-warm-700 dark:text-neutral-300 font-medium">{getRelativeDate()}</span>
                  {' '}at{' '}
                  <span>{format(mealDate, 'h:mm a')}</span>
                </p>
              </div>
              
              {/* Flag indicators - positioned to allow tooltip overflow */}
              {meal.flags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-shrink-0 relative z-10">
                  {meal.flags.slice(0, 3).map((flag, index) => {
                    const config = flagConfig[flag];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <Tooltip key={`${flag}-${index}`} label={config.label}>
                        <motion.div
                          className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center cursor-default`}
                          whileHover={{ scale: 1.08 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        >
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </motion.div>
                      </Tooltip>
                    );
                  })}
                  {meal.flags.length > 3 && (
                    <Tooltip label={`${meal.flags.length - 3} more flags`}>
                      <div className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-neutral-800 flex items-center justify-center text-warm-500 dark:text-neutral-400 text-[11px] font-semibold">
                        +{meal.flags.length - 3}
                      </div>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
            
            {/* Food items */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {meal.foods.slice(0, 4).map((food, i) => (
                <span 
                  key={i} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warm-50/80 dark:bg-neutral-800 text-warm-600 dark:text-neutral-300 text-[13px] font-medium"
                >
                  <span className="w-1 h-1 rounded-full bg-sage-400" />
                  {food.portion && <span className="text-warm-400 dark:text-neutral-500">{food.portion}</span>}
                  <span>{food.name.toLowerCase()}</span>
                </span>
              ))}
              {meal.foods.length > 4 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-sage-50 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 text-[13px] font-medium">
                  +{meal.foods.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom border accent on hover */}
      <div className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full bg-gradient-to-r from-transparent via-sage-300 dark:via-sage-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}
