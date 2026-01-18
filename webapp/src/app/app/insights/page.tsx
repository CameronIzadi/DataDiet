'use client';

import { useApp } from '@/context/AppContext';
import { InsightCard } from '@/components/InsightCard';
import { MealTimingChart } from '@/components/MealTimingChart';
import {
  getMealTimingDistribution,
  getWeeklyFlagTrend,
  getFlagDistribution,
  getEnhancedMealTiming,
  getNutritionBalance,
} from '@/services/insights';
import {
  WeeklyTrendChart,
  FlagDistributionChart,
  MealTimingComparison,
  NutritionRadar,
} from '@/components/charts';
import { Droplets, Beef, Moon, Clock, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function InsightsPage() {
  const { meals, insights, isLoading } = useApp();
  
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-warm-500">
          <div className="w-5 h-5 border-2 border-warm-300 border-t-warm-600 rounded-full animate-spin" />
          <span>Loading insights...</span>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-display text-3xl text-warm-900 mb-2">Insights</h1>
        <p className="text-warm-500 mb-8">Pattern analysis from your meals</p>
        
        <div className="card-elevated text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-warm-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-warm-400" />
          </div>
          <h3 className="text-lg font-semibold text-warm-800 mb-2">No meal data to analyze</h3>
          <p className="text-warm-500 mb-6">Log some meals first to see your patterns</p>
          <Link href="/app/capture" className="btn btn-primary">
            Log Your First Meal
          </Link>
        </div>
      </div>
    );
  }

  const timingDistribution = getMealTimingDistribution(meals);

  // Chart data calculations
  const weeklyTrendData = getWeeklyFlagTrend(meals);
  const flagDistributionData = getFlagDistribution(meals);
  const enhancedTimingData = getEnhancedMealTiming(meals);
  const nutritionBalanceData = getNutritionBalance(meals);

  const totalMeals = meals.length || 1;
  const daySpan = Math.max(1, Math.ceil(
    (Math.max(...meals.map(m => new Date(m.loggedAt).getTime())) -
      Math.min(...meals.map(m => new Date(m.loggedAt).getTime()))) /
      (1000 * 60 * 60 * 24)
  ));

  const countFlag = (flag: string) => meals.filter(m => m.flags.includes(flag as any)).length;
  const perDay = (count: number) => count / daySpan;
  const perWeek = (count: number) => (count / daySpan) * 7;
  const percent = (count: number) => Math.round((count / totalMeals) * 100);
  const concern = (value: number, moderate: number, elevated: number) =>
    value > elevated ? 'elevated' : value > moderate ? 'moderate' : 'low';

  const lateCaffeineCount = meals.filter(m => {
    if (!m.flags.includes('caffeine' as any)) return false;
    const hour = new Date(m.loggedAt).getHours();
    return hour >= 14;
  }).length;

  const extraInsightCards = [
    {
      key: 'plastic_container_hot',
      icon: <span className="text-2xl">🥡</span>,
      title: 'Hot Plastic Containers',
      value: perDay(countFlag('plastic_container_hot')).toFixed(1),
      unit: 'per day',
      concernLevel: concern(perDay(countFlag('plastic_container_hot')), 0.15, 0.3),
      context: 'Heat increases plastic leaching and microplastic release. Avoid microwaving or serving hot food in plastic when possible.',
      subtext: `${countFlag('plastic_container_hot')} meals in this period`,
    },
    {
      key: 'ultra_processed',
      icon: <span className="text-2xl">📦</span>,
      title: 'Ultra‑Processed Foods',
      value: percent(countFlag('ultra_processed')),
      unit: '%',
      concernLevel: concern(percent(countFlag('ultra_processed')), 30, 50),
      context: 'Ultra‑processed foods are linked to increased cardiometabolic risk. Aim for more whole or minimally processed meals.',
      subtext: `${countFlag('ultra_processed')} meals flagged`,
    },
    {
      key: 'charred_grilled',
      icon: <span className="text-2xl">🔥</span>,
      title: 'Charred/Grilled',
      value: perWeek(countFlag('charred_grilled')).toFixed(1),
      unit: 'per week',
      concernLevel: concern(perWeek(countFlag('charred_grilled')), 2, 4),
      context: 'Heavily charred foods can contain HCAs/PAHs. Trimming charred portions may reduce exposure.',
      subtext: `${countFlag('charred_grilled')} meals in this period`,
    },
    {
      key: 'fried',
      icon: <span className="text-2xl">🍟</span>,
      title: 'Fried Foods',
      value: perWeek(countFlag('fried')).toFixed(1),
      unit: 'per week',
      concernLevel: concern(perWeek(countFlag('fried')), 3, 5),
      context: 'Frequent fried foods are associated with higher cardiovascular risk and inflammation.',
      subtext: `${countFlag('fried')} meals in this period`,
    },
    {
      key: 'high_sugar_beverage',
      icon: <span className="text-2xl">🥤</span>,
      title: 'Sugary Beverages',
      value: perDay(countFlag('high_sugar_beverage')).toFixed(1),
      unit: 'per day',
      concernLevel: concern(perDay(countFlag('high_sugar_beverage')), 0.5, 1),
      context: 'Sugary drinks are strongly linked to metabolic issues and increased cardiometabolic risk.',
      subtext: `${countFlag('high_sugar_beverage')} drinks in this period`,
    },
    {
      key: 'caffeine',
      icon: <span className="text-2xl">☕</span>,
      title: 'Caffeine',
      value: perDay(countFlag('caffeine')).toFixed(1),
      unit: 'per day',
      concernLevel: concern(perDay(countFlag('caffeine')), 3, 4),
      context: 'High caffeine intake can affect sleep and anxiety. Consider limiting after 2pm.',
      subtext: `${lateCaffeineCount} after 2pm`,
    },
    {
      key: 'alcohol',
      icon: <span className="text-2xl">🍷</span>,
      title: 'Alcohol',
      value: perWeek(countFlag('alcohol')).toFixed(1),
      unit: 'per week',
      concernLevel: concern(perWeek(countFlag('alcohol')), 7, 14),
      context: 'Regular alcohol intake is associated with increased health risks. Moderation is recommended.',
      subtext: `${countFlag('alcohol')} drinks in this period`,
    },
    {
      key: 'high_sodium',
      icon: <span className="text-2xl">🧂</span>,
      title: 'High Sodium Meals',
      value: perDay(countFlag('high_sodium')).toFixed(1),
      unit: 'per day',
      concernLevel: concern(perDay(countFlag('high_sodium')), 0.7, 1.2),
      context: 'High sodium intake is linked to hypertension and cardiovascular risk. Aim for lower‑sodium meals.',
      subtext: `${countFlag('high_sodium')} meals flagged`,
    },
    {
      key: 'refined_grain',
      icon: <span className="text-2xl">🍞</span>,
      title: 'Refined Grains',
      value: percent(countFlag('refined_grain')),
      unit: '%',
      concernLevel: concern(percent(countFlag('refined_grain')), 40, 60),
      context: 'Diets heavy in refined grains are linked to higher cardiovascular risk versus whole grains.',
      subtext: `${countFlag('refined_grain')} meals flagged`,
    },
    {
      key: 'spicy_irritant',
      icon: <span className="text-2xl">🌶️</span>,
      title: 'Spicy Irritants',
      value: perWeek(countFlag('spicy_irritant')).toFixed(1),
      unit: 'per week',
      concernLevel: concern(perWeek(countFlag('spicy_irritant')), 4, 7),
      context: 'Spicy foods can irritate sensitive GI systems. Track if you have gut symptoms.',
      subtext: `${countFlag('spicy_irritant')} meals in this period`,
    },
    {
      key: 'acidic_trigger',
      icon: <span className="text-2xl">🍋</span>,
      title: 'Acidic Triggers',
      value: perWeek(countFlag('acidic_trigger')).toFixed(1),
      unit: 'per week',
      concernLevel: concern(perWeek(countFlag('acidic_trigger')), 4, 7),
      context: 'Acidic foods can worsen reflux or GERD. Track if you experience symptoms.',
      subtext: `${countFlag('acidic_trigger')} meals in this period`,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-display text-3xl text-warm-900 mb-2">Insights</h1>
        <p className="text-warm-500">
          {insights.totalMeals} meals analyzed • {insights.dateRange}
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-10 stagger">
        <InsightCard
          icon={<Droplets className="w-5 h-5" />}
          title="Plastic Bottle Exposure"
          value={insights.plastic.count}
          unit="bottles"
          concernLevel={insights.plastic.concernLevel}
          context="Microplastics and BPA from plastic containers are linked to endocrine disruption. Emerging research suggests reducing single-use plastic consumption."
          subtext={`${insights.plastic.perDay.toFixed(1)} per day average`}
        />

        <InsightCard
          icon={<Beef className="w-5 h-5" />}
          title="Processed Meat"
          value={insights.processedMeat.perWeek.toFixed(1)}
          unit="per week"
          concernLevel={insights.processedMeat.concernLevel}
          context="WHO classifies processed meat as a Group 1 carcinogen. High consumption is associated with increased colorectal cancer risk. Recommended: <3 servings/week."
          subtext={`${insights.processedMeat.count} servings in this period`}
        />

        <InsightCard
          icon={<Moon className="w-5 h-5" />}
          title="Late Night Meals"
          value={insights.mealTiming.lateMealPercent}
          unit="%"
          concernLevel={insights.mealTiming.concernLevel}
          context="Eating after 9pm is associated with disrupted circadian rhythm, impaired glucose metabolism, elevated triglycerides, and poor sleep quality."
          subtext={insights.patterns.weekendVsWeekday}
        />

        <InsightCard
          icon={<Clock className="w-5 h-5" />}
          title="Average Dinner Time"
          value={insights.mealTiming.avgDinnerTime}
          concernLevel={
            insights.mealTiming.avgDinnerTime.includes('10:') || 
            insights.mealTiming.avgDinnerTime.includes('11:') ||
            insights.mealTiming.avgDinnerTime.includes('9:')
              ? 'moderate' 
              : 'low'
          }
          context="Research suggests eating dinner before 8pm allows for better digestion, improved sleep, and more stable blood sugar levels."
          subtext={`Most meals on ${insights.patterns.busiestDay}`}
        />
      </div>

      {/* Weekly Flag Trend - Full Width Area Chart */}
      <div className="mb-10">
        <WeeklyTrendChart data={weeklyTrendData} />
      </div>

      {/* Distribution Section - 2 Columns */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <FlagDistributionChart data={flagDistributionData} totalMeals={totalMeals} />
        <MealTimingComparison data={enhancedTimingData} />
      </div>

      {/* Nutrition Radar - Conditional Full Width */}
      {nutritionBalanceData && (
        <div className="mb-10">
          <NutritionRadar data={nutritionBalanceData} />
        </div>
      )}

      {/* Original Meal Timing Distribution - Simple View */}
      <div className="mb-10">
        <MealTimingChart data={timingDistribution} />
      </div>

      {/* Additional Signals (Detailed) */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-warm-800 mb-4">Additional Signals</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {extraInsightCards.map((card) => (
            <InsightCard
              key={card.key}
              icon={card.icon}
              title={card.title}
              value={card.value}
              unit={card.unit}
              concernLevel={card.concernLevel as any}
              context={card.context}
              subtext={card.subtext}
            />
          ))}
        </div>
      </div>

      {/* What We Track Note */}
      <div className="card-elevated bg-sage-50 border-sage-100 mb-10">
        <h3 className="font-semibold text-sage-800 mb-4">What We Track (That Nobody Else Does)</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-sage-700">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-2 flex-shrink-0" />
            <span><strong>Plastic exposure</strong> — BPA and microplastic concerns</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-2 flex-shrink-0" />
            <span><strong>Carcinogenic foods</strong> — WHO-classified processed meats</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-2 flex-shrink-0" />
            <span><strong>Meal timing</strong> — Circadian and metabolic impacts</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sage-500 mt-2 flex-shrink-0" />
            <span><strong>Long-term patterns</strong> — Not daily guilt, but real trends</span>
          </div>
        </div>
      </div>

      {/* CTA to Report */}
      <div className="text-center">
        <Link href="/app/report" className="btn btn-primary btn-lg group">
          Generate Doctor Report
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
