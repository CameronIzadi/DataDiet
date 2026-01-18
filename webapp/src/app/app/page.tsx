'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { MealCard, flagConfig } from '@/components/MealCard';
import { Meal, MealFlag } from '@/types';
import { X, Utensils, Smartphone, RefreshCw, Sparkles, ArrowRight, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

// Meal Detail Modal
function MealDetailModal({ meal, onClose }: { meal: Meal; onClose: () => void }) {
  const mealDate = new Date(meal.loggedAt);
  const dateString = format(mealDate, 'EEEE, MMMM d, yyyy');
  const timeString = format(mealDate, 'h:mm a');
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
      <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="flex flex-col md:flex-row max-h-[80vh]">
          <div className="md:w-2/5 flex-shrink-0">
            {meal.imageUrl ? (
              <img src={meal.imageUrl} alt={displayName} className="w-full h-48 md:h-full object-cover" />
            ) : (
              <div className="w-full h-48 md:h-full bg-warm-100 dark:bg-neutral-800 flex items-center justify-center">
                <Utensils className="w-16 h-16 text-warm-300 dark:text-neutral-600" />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between p-5 border-b border-warm-100 dark:border-neutral-800">
              <div>
                <h2 className="text-xl font-semibold text-warm-900 dark:text-white">{displayName}</h2>
                <p className="text-sm text-warm-500 dark:text-neutral-400 mt-1">{dateString} · {timeString}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-neutral-800 flex items-center justify-center text-warm-500 hover:bg-warm-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <h3 className="text-xs font-medium text-warm-400 dark:text-neutral-500 uppercase tracking-wide mb-2">Dietary Signals</h3>
                {hasFlags ? (
                  <div className="flex flex-wrap gap-2">
                    {meal.flags.map((flag, i) => {
                      const config = flagConfig[flag];
                      if (!config) return null;
                      const Icon = config.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                          <Icon className="w-4 h-4 text-rose-500" />
                          <span className="text-sm text-rose-700 dark:text-rose-300">{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 w-fit">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">No flags detected</span>
                  </div>
                )}
              </div>
              {meal.foods.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-warm-400 dark:text-neutral-500 uppercase tracking-wide mb-2">Foods Detected</h3>
                  <div className="space-y-1">
                    {meal.foods.map((food, i) => (
                      <div key={i} className="flex items-center justify-between py-1">
                        <span className="text-sm text-warm-800 dark:text-neutral-200">{food.name}</span>
                        {food.portion && <span className="text-xs text-warm-400">{food.portion}</span>}
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
  const { meals, insights, isLoading, loadDemoData, user } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [showAllMeals, setShowAllMeals] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
          <p className="text-warm-500 dark:text-neutral-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.displayName?.split(' ')[0];

  // Calculate key metrics
  const totalFlags = meals.reduce((acc, meal) => acc + meal.flags.length, 0);
  const cleanMeals = meals.filter(m => m.flags.length === 0).length;
  const cleanPercent = meals.length > 0 ? Math.round((cleanMeals / meals.length) * 100) : 0;

  // Get top concerns (most frequent flags)
  const flagCounts: Record<string, number> = {};
  meals.forEach(meal => {
    meal.flags.forEach(flag => {
      flagCounts[flag] = (flagCounts[flag] || 0) + 1;
    });
  });
  const topConcerns = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([flag, count]) => ({ flag, count, config: flagConfig[flag as MealFlag] }))
    .filter(c => c.config);

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-warm-500 dark:text-neutral-400 text-sm mb-1">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-display text-3xl text-warm-900 dark:text-white">
            {getGreeting()}{firstName ? `, ${firstName}` : ''}
          </h1>
        </div>

        {/* Empty State */}
        {meals.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-sage-600 dark:text-sage-400" />
            </div>
            <h2 className="text-xl font-semibold text-warm-900 dark:text-white mb-2">No meals logged yet</h2>
            <p className="text-warm-500 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
              Use the iOS app to photograph your meals. They'll sync here automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors">
                <Smartphone className="w-4 h-4" />
                Get iOS App
              </button>
              <button
                onClick={loadDemoData}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-warm-200 dark:border-neutral-700 text-warm-600 dark:text-neutral-300 font-medium rounded-xl hover:bg-warm-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Load Demo Data
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {meals.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left Column - Summary & Concerns */}
            <div className="lg:col-span-1 space-y-4">

              {/* Summary Card */}
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 p-5">
                <h2 className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-4">Overview</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-warm-600 dark:text-neutral-300">Total meals</span>
                    <span className="text-xl font-semibold text-warm-900 dark:text-white">{meals.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-warm-600 dark:text-neutral-300">Clean meals</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">{cleanPercent}%</span>
                      {cleanPercent >= 70 ? (
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      ) : cleanPercent >= 50 ? (
                        <Minus className="w-4 h-4 text-warm-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-warm-600 dark:text-neutral-300">Flags detected</span>
                    <span className="text-xl font-semibold text-amber-600 dark:text-amber-400">{totalFlags}</span>
                  </div>
                </div>
              </div>

              {/* Top Concerns */}
              {topConcerns.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 p-5">
                  <h2 className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-4">Top Concerns</h2>
                  <div className="space-y-3">
                    {topConcerns.map(({ flag, count, config }) => {
                      const Icon = config.icon;
                      return (
                        <div key={flag} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                            <Icon className="w-4 h-4 text-rose-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-warm-800 dark:text-neutral-200 truncate">{config.label}</p>
                          </div>
                          <span className="text-sm text-warm-500 dark:text-neutral-400">{count}×</span>
                        </div>
                      );
                    })}
                  </div>
                  <Link
                    href="/app/insights"
                    className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-warm-100 dark:border-neutral-800 text-sm font-medium text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 transition-colors"
                  >
                    View all insights
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* No Concerns - Clean Diet */}
              {topConcerns.length === 0 && meals.length > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="font-medium text-emerald-800 dark:text-emerald-300">Looking good!</h2>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400">
                    No dietary concerns detected in your recent meals.
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Recent Meals */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-warm-900 dark:text-white">
                  {showAllMeals ? 'All Meals' : 'Recent Meals'}
                </h2>
                {meals.length > 6 && (
                  <button
                    onClick={() => setShowAllMeals(!showAllMeals)}
                    className="text-sm text-sage-600 dark:text-sage-400 hover:text-sage-700 font-medium"
                  >
                    {showAllMeals ? 'Show less' : 'View all'}
                  </button>
                )}
              </div>

              {!showAllMeals ? (
                <>
                  <div className="space-y-3">
                    {meals.slice(0, 6).map((meal) => (
                      <MealCard key={meal.id} meal={meal} onClick={() => setSelectedMeal(meal)} />
                    ))}
                  </div>

                  {meals.length > 6 && (
                    <button
                      onClick={() => setShowAllMeals(true)}
                      className="flex items-center justify-center gap-2 mt-4 py-3 w-full text-sm text-warm-500 dark:text-neutral-400 hover:text-sage-600 dark:hover:text-sage-400 transition-colors"
                    >
                      + {meals.length - 6} more meals
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* All meals grouped by date */}
                  {(() => {
                    // Group meals by date
                    const mealsByDate: Record<string, Meal[]> = {};
                    meals.forEach(meal => {
                      const dateKey = format(new Date(meal.loggedAt), 'yyyy-MM-dd');
                      if (!mealsByDate[dateKey]) {
                        mealsByDate[dateKey] = [];
                      }
                      mealsByDate[dateKey].push(meal);
                    });

                    // Sort dates in descending order
                    const sortedDates = Object.keys(mealsByDate).sort((a, b) => b.localeCompare(a));

                    return sortedDates.map(dateKey => {
                      const dateMeals = mealsByDate[dateKey];
                      const dateObj = new Date(dateKey);
                      const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
                      const isYesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd') === dateKey;
                      const dateLabel = isToday
                        ? 'Today'
                        : isYesterday
                        ? 'Yesterday'
                        : format(dateObj, 'EEEE, MMMM d');

                      return (
                        <div key={dateKey} className="mb-6">
                          <h3 className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-3">
                            {dateLabel}
                            <span className="ml-2 text-warm-400 dark:text-neutral-500">
                              · {dateMeals.length} meal{dateMeals.length !== 1 ? 's' : ''}
                            </span>
                          </h3>
                          <div className="space-y-3">
                            {dateMeals.map((meal) => (
                              <MealCard key={meal.id} meal={meal} onClick={() => setSelectedMeal(meal)} />
                            ))}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
      </AnimatePresence>
    </div>
  );
}
