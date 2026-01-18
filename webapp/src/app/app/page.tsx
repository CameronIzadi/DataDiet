'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MealCard, flagConfig } from '@/components/MealCard';
import { Meal } from '@/types';
import { X, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Sparkles,
  ArrowRight,
  Droplets,
  Beef,
  Moon,
  Clock,
  Activity,
  ChevronRight,
  ChevronDown,
  Calendar,
  Shield,
  Cloud,
  Flame,
  Thermometer,
  Package,
  Zap,
  Smartphone,
  Sunrise,
  Sun,
  CloudSun,
  Sunset
} from 'lucide-react';

// Static number display (removed counting animation for calm dashboard)
function StaticNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  return <span>{value}{suffix}</span>;
}

// Circular progress ring (simplified - quick fade-in only)
function ProgressRing({ progress, size = 80, strokeWidth = 6, color = 'sage' }: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorMap: Record<string, string> = {
    sage: '#5c7a5c',
    blue: '#3b82f6',
    rose: '#f43f5e',
    amber: '#f59e0b',
    violet: '#8b5cf6',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-warm-100 dark:text-neutral-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-warm-800 dark:text-neutral-100">{progress}%</span>
      </div>
    </div>
  );
}

// Subtle container animations (calm dashboard - minimal movement)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

// Weekly Calendar Component (Clean calendar style)
function WeeklyCalendar({ meals }: { meals: any[] }) {
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get current week (Sunday to Saturday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    const count = meals.filter(m => {
      const mealDate = new Date(m.loggedAt);
      return mealDate.toDateString() === date.toDateString();
    }).length;

    return {
      date,
      dayName: days[i],
      dayNum: date.getDate(),
      count,
      isToday: date.toDateString() === today.toDateString(),
      isFuture: date > today,
    };
  });

  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      {/* Month header */}
      <div className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-4">
        {monthName}
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day.dayNum}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${
              day.isToday
                ? 'bg-sage-100 dark:bg-sage-900/30'
                : day.isFuture
                ? 'opacity-40'
                : 'hover:bg-warm-50 dark:hover:bg-neutral-800/50'
            }`}
          >
            {/* Day name */}
            <span className={`text-[10px] font-medium uppercase mb-1 ${
              day.isToday
                ? 'text-sage-600 dark:text-sage-400'
                : 'text-warm-400 dark:text-neutral-500'
            }`}>
              {day.dayName.charAt(0)}
            </span>

            {/* Day number */}
            <span className={`text-lg font-semibold mb-1 ${
              day.isToday
                ? 'text-sage-700 dark:text-sage-300'
                : 'text-warm-700 dark:text-neutral-300'
            }`}>
              {day.dayNum}
            </span>

            {/* Meal indicator dots */}
            {!day.isFuture && (
              <div className="flex gap-0.5">
                {day.count === 0 ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-warm-200 dark:bg-neutral-700" />
                ) : (
                  Array.from({ length: Math.min(day.count, 4) }, (_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-sage-500 dark:bg-sage-400"
                    />
                  ))
                )}
                {day.count > 4 && (
                  <span className="text-[8px] text-sage-500 dark:text-sage-400 ml-0.5">+</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Meal Time Distribution Component
function MealTimeDistribution({ meals }: { meals: any[] }) {
  const timeSlots = [
    { label: 'Morning', range: '6am-11am', icon: Sunrise, start: 6, end: 11 },
    { label: 'Midday', range: '11am-2pm', icon: Sun, start: 11, end: 14 },
    { label: 'Afternoon', range: '2pm-6pm', icon: CloudSun, start: 14, end: 18 },
    { label: 'Evening', range: '6pm-9pm', icon: Sunset, start: 18, end: 21 },
    { label: 'Night', range: '9pm-6am', icon: Moon, start: 21, end: 6 },
  ];

  const distribution = timeSlots.map(slot => {
    const count = meals.filter(m => {
      const hour = new Date(m.loggedAt).getHours();
      if (slot.start > slot.end) {
        return hour >= slot.start || hour < slot.end;
      }
      return hour >= slot.start && hour < slot.end;
    }).length;
    return { ...slot, count };
  });

  const maxCount = Math.max(...distribution.map(d => d.count), 1);

  return (
    <div className="space-y-3">
      {distribution.map((slot) => (
        <div key={slot.label} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
            <slot.icon className="w-4 h-4 text-violet-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-warm-700 dark:text-neutral-300">{slot.label}</span>
              <span className="text-xs text-warm-400 dark:text-neutral-500">{slot.count}</span>
            </div>
            <div className="h-2 bg-warm-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${(slot.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Meal Detail Modal Component (Professional webapp modal)
function MealDetailModal({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const mealDate = new Date(meal.loggedAt);

  const dateString = format(mealDate, 'EEEE, MMMM d, yyyy');
  const timeString = format(mealDate, 'h:mm a');

  // Get primary food name
  const primaryFood = meal.foods.length > 0 ? meal.foods[0].name : 'Meal';
  const foodCount = meal.foods.length;
  const displayName = foodCount > 1 ? `${primaryFood} +${foodCount - 1}` : primaryFood;

  const hasFlags = meal.flags && meal.flags.length > 0;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col md:flex-row max-h-[80vh]">
          {/* Image Side */}
          <div className="md:w-2/5 flex-shrink-0">
            {meal.imageUrl ? (
              <img
                src={meal.imageUrl}
                alt={displayName}
                className="w-full h-48 md:h-full object-cover"
              />
            ) : (
              <div className="w-full h-48 md:h-full bg-gradient-to-br from-warm-100 to-warm-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                <Utensils className="w-16 h-16 text-warm-300 dark:text-neutral-500" />
              </div>
            )}
          </div>

          {/* Content Side */}
          <div className="flex-1 flex flex-col md:w-3/5">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-warm-100 dark:border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-warm-900 dark:text-white">
                  {displayName}
                </h2>
                <p className="text-sm text-warm-500 dark:text-neutral-400 mt-1">
                  {dateString} · {timeString}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-neutral-800 flex items-center justify-center text-warm-500 dark:text-neutral-400 hover:bg-warm-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* Dietary Signals */}
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-warm-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                  Dietary Signals
                </h3>
                {hasFlags ? (
                  <div className="flex flex-wrap gap-2">
                    {meal.flags.map((flag, i) => {
                      const config = flagConfig[flag];
                      if (!config) return null;
                      const Icon = config.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-900/20"
                        >
                          <Icon className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                          <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
                            {config.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 w-fit">
                    <Shield className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      No flags detected
                    </span>
                  </div>
                )}
              </div>

              {/* Foods */}
              {meal.foods.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-warm-400 dark:text-neutral-500 uppercase tracking-wider mb-3">
                    Foods Detected
                  </h3>
                  <div className="space-y-1">
                    {meal.foods.map((food, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5"
                      >
                        <span className="text-sm text-warm-800 dark:text-neutral-200">{food.name}</span>
                        {food.portion && (
                          <span className="text-xs text-warm-400 dark:text-neutral-500">{food.portion}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AppDashboard() {
  const { meals, insights, isLoading, isSyncing, loadDemoData, user } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showMoreStats, setShowMoreStats] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </div>
          <p className="text-warm-500 dark:text-neutral-400 font-medium">Loading your data...</p>
        </motion.div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper to count flag occurrences
  const countFlagOccurrences = (flag: string) => {
    return meals.reduce((count, meal) => {
      return count + (meal.flags.includes(flag as any) ? 1 : 0);
    }, 0);
  };

  // Calculate health score based on dietary flag frequency
  // Algorithm: Start at 100, deduct based on flag rates weighted by health impact
  const calculateHealthScore = (): number => {
    if (meals.length === 0) return 0;

    const totalMeals = meals.length;

    // Flag weights based on established health research
    // Higher weight = more significant health concern
    const flagWeights: Record<string, { weight: number; maxPenalty: number }> = {
      // HIGH IMPACT - Major health concerns (WHO/Medical consensus)
      processed_meat: { weight: 8, maxPenalty: 20 },     // WHO Group 1 carcinogen
      alcohol: { weight: 7, maxPenalty: 18 },            // Known carcinogen, no safe level
      ultra_processed: { weight: 6, maxPenalty: 15 },    // Obesity, diabetes, CVD risk

      // MODERATE IMPACT - Established concerns
      plastic_container_hot: { weight: 5, maxPenalty: 12 }, // BPA/phthalate leaching when heated
      charred_grilled: { weight: 5, maxPenalty: 12 },    // HCAs and PAHs formation
      fried: { weight: 4, maxPenalty: 10 },              // Trans fats, AGEs
      high_sugar_beverage: { weight: 4, maxPenalty: 10 }, // Metabolic syndrome risk
      high_sodium: { weight: 3, maxPenalty: 8 },         // Hypertension risk

      // LOWER IMPACT - Contextual concerns
      plastic_bottle: { weight: 2, maxPenalty: 6 },      // Microplastics exposure
      late_meal: { weight: 2, maxPenalty: 6 },           // Circadian/metabolic disruption
      refined_grain: { weight: 2, maxPenalty: 5 },       // Glycemic impact

      // MINIMAL IMPACT - Individual sensitivity dependent
      caffeine: { weight: 1, maxPenalty: 3 },            // Sleep disruption if late
      spicy_irritant: { weight: 0.5, maxPenalty: 2 },    // GI sensitive individuals
      acidic_trigger: { weight: 0.5, maxPenalty: 2 },    // Reflux prone individuals
    };

    let totalPenalty = 0;

    Object.entries(flagWeights).forEach(([flag, { weight, maxPenalty }]) => {
      const count = countFlagOccurrences(flag);
      if (count === 0) return;

      // Calculate rate (occurrences per meal)
      const rate = count / totalMeals;

      // Apply diminishing returns: first occurrences matter more
      // Using logarithmic scaling: ln(1 + rate * 10) normalizes rate impact
      const scaledRate = Math.log(1 + rate * 10) / Math.log(11); // Normalize to 0-1

      // Calculate penalty: weight determines base severity, maxPenalty caps it
      const penalty = Math.min(maxPenalty, scaledRate * weight * 5);
      totalPenalty += penalty;
    });

    // Bonus: reward for clean meals (meals with no flags)
    const cleanMeals = meals.filter(m => m.flags.length === 0).length;
    const cleanMealBonus = Math.min(10, (cleanMeals / totalMeals) * 15);

    // Final score: start at 100, subtract penalties, add bonus, clamp to 20-100
    const rawScore = 100 - totalPenalty + cleanMealBonus;
    return Math.round(Math.max(20, Math.min(100, rawScore)));
  };

  const healthScore = calculateHealthScore();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#f5f5f5] dark:bg-neutral-950"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-2 pb-8">
      {/* Header */}
      <motion.div className="mb-4" variants={itemVariants}>
        <div className="flex items-center gap-2 text-warm-400 dark:text-neutral-400 text-sm mb-1">
          <Calendar className="w-4 h-4" />
          {formatDate(currentTime)}
          {/* Sync status indicator */}
          {user && (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              isSyncing
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
            }`}>
              {isSyncing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Cloud className="w-3 h-3" />
                  </motion.div>
                  Syncing...
                </>
              ) : (
                <>
                  <Cloud className="w-3 h-3" />
                  Synced
                </>
              )}
            </span>
          )}
        </div>
        <h1 className="text-display text-2xl md:text-3xl text-warm-900 dark:text-white mb-1">
          {getGreeting()}{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
        </h1>
        <p className="text-warm-500 dark:text-neutral-400">
          {meals.length > 0
            ? `${insights.totalMeals} meals logged • ${insights.dateRange}`
            : 'Start capturing your meals to build your dietary history'
          }
        </p>
      </motion.div>

      {/* Health Overview - Only show if meals exist */}
      {meals.length > 0 && (
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-warm-100 dark:border-neutral-800 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
              {/* Health Score */}
              <div className="flex items-center gap-6">
                <ProgressRing progress={Math.round(healthScore)} size={100} strokeWidth={8} color="sage" />
                <div>
                  <h3 className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-1">Health Score</h3>
                  <p className="text-2xl font-bold text-warm-900 dark:text-white">
                    {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Work'}
                  </p>
                  <p className="text-sm text-warm-400 dark:text-neutral-500">Based on your patterns</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-20 bg-warm-200 dark:bg-neutral-700" />

              {/* Quick Stats Row */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">Meals Logged</p>
                  <p className="text-2xl font-bold text-warm-900 dark:text-white">
                    <StaticNumber value={insights.totalMeals} />
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">This Week</p>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    <StaticNumber value={Math.min(meals.length, 7)} />
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">Streak</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    <StaticNumber value={Math.min(meals.length, 5)} suffix=" days" />
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">Avg/Day</p>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {(insights.totalMeals / Math.max(1, 7)).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Cards - Primary Metrics */}
      {meals.length > 0 && (
        <>
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4"
            variants={containerVariants}
          >
            {[
              {
                icon: Clock,
                value: insights.totalMeals,
                label: 'Meals Logged',
                good: true,
              },
              {
                icon: Droplets,
                value: insights.plastic.count,
                label: 'Plastic Exposure',
                subLabel: `${insights.plastic.perDay.toFixed(1)}/day`,
                alert: insights.plastic.count > 10,
              },
              {
                icon: Beef,
                value: insights.processedMeat.count,
                label: 'Processed Meat',
                subLabel: `${insights.processedMeat.perWeek.toFixed(1)}/week`,
                alert: insights.processedMeat.count > 5,
              },
              {
                icon: Moon,
                value: insights.mealTiming.lateMealPercent,
                label: 'Late Meals',
                suffix: '%',
                alert: insights.mealTiming.lateMealPercent > 30,
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                className="relative group"
                variants={itemVariants}
              >
                <div className={`bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 overflow-hidden transition-shadow duration-200 hover:shadow-md ${stat.alert ? 'border-l-4 border-l-rose-400' : 'border-l-4 border-l-teal-400'}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.alert ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-teal-50 dark:bg-teal-900/20'} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.alert ? 'text-rose-500' : 'text-teal-600'}`} />
                      </div>
                      {stat.alert && (
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      )}
                      {stat.good && (
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-warm-500 dark:text-neutral-400 mb-0.5">{stat.label}</p>
                    <p className="text-2xl font-bold text-warm-900 dark:text-white">
                      <StaticNumber value={stat.value} suffix={stat.suffix} />
                    </p>
                    {stat.subLabel && (
                      <p className="text-[10px] text-warm-400 dark:text-neutral-500">{stat.subLabel}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Secondary Stats - Expandable (appears above the toggle button) */}
          <AnimatePresence>
            {showMoreStats && (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                {[
                  {
                    icon: Thermometer,
                    value: countFlagOccurrences('plastic_container_hot'),
                    label: 'Hot in Plastic',
                    subLabel: `${(countFlagOccurrences('plastic_container_hot') / Math.max(meals.length, 1)).toFixed(1)}/day`,
                    alert: countFlagOccurrences('plastic_container_hot') > 5,
                  },
                  {
                    icon: Flame,
                    value: countFlagOccurrences('charred_grilled'),
                    label: 'Charred/Grilled',
                    subLabel: `${(countFlagOccurrences('charred_grilled') / Math.max(meals.length / 7, 1)).toFixed(1)}/week`,
                    alert: countFlagOccurrences('charred_grilled') > 7,
                  },
                  {
                    icon: Package,
                    value: countFlagOccurrences('ultra_processed'),
                    label: 'Ultra Processed',
                    subLabel: `${(countFlagOccurrences('ultra_processed') / Math.max(meals.length / 7, 1)).toFixed(1)}/week`,
                    alert: countFlagOccurrences('ultra_processed') > 10,
                  },
                  {
                    icon: Zap,
                    value: countFlagOccurrences('fried'),
                    label: 'Fried Foods',
                    subLabel: `${(countFlagOccurrences('fried') / Math.max(meals.length / 7, 1)).toFixed(1)}/week`,
                    alert: countFlagOccurrences('fried') > 7,
                  },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    className="relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className={`bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 overflow-hidden transition-shadow duration-200 hover:shadow-md ${stat.alert ? 'border-l-4 border-l-rose-400' : 'border-l-4 border-l-teal-400'}`}>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${stat.alert ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-teal-50 dark:bg-teal-900/20'} flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.alert ? 'text-rose-500' : 'text-teal-600'}`} />
                          </div>
                          {stat.alert && (
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <p className="text-xs text-warm-500 dark:text-neutral-400 mb-0.5">{stat.label}</p>
                        <p className="text-2xl font-bold text-warm-900 dark:text-white">
                          <StaticNumber value={stat.value} />
                        </p>
                        {stat.subLabel && (
                          <p className="text-[10px] text-warm-400 dark:text-neutral-500">{stat.subLabel}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* More Insights Toggle - positioned AFTER expandable content so it moves down */}
          <motion.button
            onClick={() => setShowMoreStats(!showMoreStats)}
            className="w-full flex items-center justify-center gap-2 py-3 mb-8 text-sm font-medium text-warm-500 dark:text-neutral-400 hover:text-warm-700 dark:hover:text-neutral-200 transition-colors"
            variants={itemVariants}
          >
            <span>{showMoreStats ? 'Hide' : 'Show'} More Insights</span>
            <motion.div
              animate={{ rotate: showMoreStats ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </>
      )}

      {/* Activity Overview */}
      {meals.length > 0 && (
        <motion.div
          className="grid md:grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
        >
          {/* Weekly Calendar */}
          <motion.div
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 p-5"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warm-900 dark:text-white">This Week</h3>
              <span className="text-xs text-warm-400 dark:text-neutral-500">
                {meals.filter(m => {
                  const mealDate = new Date(m.loggedAt);
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay());
                  return mealDate >= startOfWeek;
                }).length} meals
              </span>
            </div>
            <WeeklyCalendar meals={meals} />
          </motion.div>

          {/* Meal Time Distribution */}
          <motion.div
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 p-5"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-warm-900 dark:text-white">Meal Timing</h3>
              <span className="text-xs text-warm-400 dark:text-neutral-500">When you eat</span>
            </div>
            <MealTimeDistribution meals={meals} />
          </motion.div>
        </motion.div>
      )}

      {/* Recent Meals */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-warm-900 dark:text-neutral-100">Recent Meals</h2>
            <p className="text-sm text-warm-400 dark:text-neutral-500">Your latest captures</p>
          </div>
          {meals.length > 5 && (
            <Link href="/app/insights" className="text-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {meals.length === 0 ? (
            <motion.div
              className="card-elevated text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-sage-500" />
              </div>
              <h3 className="text-xl font-semibold text-warm-800 dark:text-neutral-100 mb-2">No meals logged yet</h3>
              <p className="text-warm-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                Download the iOS app to start logging your meals and building your dietary history.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="#" className="btn btn-primary inline-flex">
                  <Smartphone className="w-5 h-5" />
                  Get iOS App
                </Link>
                <button onClick={loadDemoData} className="btn btn-secondary btn-sm">
                  <RefreshCw className="w-4 h-4" />
                  Load Demo Data
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {meals.slice(0, 5).map((meal) => (
                <motion.div key={meal.id} variants={itemVariants}>
                  <MealCard meal={meal} onClick={() => setSelectedMeal(meal)} />
                </motion.div>
              ))}
              {meals.length > 5 && (
                <motion.div 
                  className="text-center pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link 
                    href="/app/insights" 
                    className="text-sm text-warm-500 hover:text-sage-600 transition-colors inline-flex items-center gap-2"
                  >
                    <span>+ {meals.length - 5} more meals logged</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>

      {/* Meal Detail Modal */}
      <AnimatePresence>
        {selectedMeal && (
          <MealDetailModal
            meal={selectedMeal}
            onClose={() => setSelectedMeal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
