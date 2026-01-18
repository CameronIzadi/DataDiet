'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
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
import {
  Droplets,
  Beef,
  Moon,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  Package,
  Flame,
  UtensilsCrossed,
  GlassWater,
  Coffee,
  Wine,
  Cylinder,
  X
} from 'lucide-react';
import Link from 'next/link';

// Signal detail information for modals
const signalDetails: Record<string, {
  title: string;
  why: string;
  risks: string[];
  threshold: string;
  sources: string[];
}> = {
  'Plastic Exposure': {
    title: 'Plastic Exposure',
    why: 'Drinking from plastic bottles and heating food in plastic containers exposes you to BPA, phthalates, and microplastics. These chemicals leach into food and drinks, especially when heated or containing acidic/fatty contents.',
    risks: [
      'Endocrine disruption - mimics estrogen and disrupts hormones',
      'Increased risk of obesity and metabolic syndrome',
      'Potential links to breast and prostate cancer',
      'Reproductive health issues and fertility concerns',
      'Cardiovascular disease associations',
      'Microplastics accumulate in organs over time',
    ],
    threshold: 'Minimize plastic contact with food. Use glass, stainless steel, or ceramic. Never microwave in plastic.',
    sources: ['Endocrine Society', 'Environmental Health Perspectives', 'WHO Microplastics Report'],
  },
  'Processed Meat': {
    title: 'Processed Meat Consumption',
    why: 'Processed meats (bacon, hot dogs, deli meats, sausages) are classified as Group 1 carcinogens by the WHO - the same category as tobacco and asbestos. They contain nitrates, nitrites, and are often smoked or cured.',
    risks: [
      '18% increased colorectal cancer risk per 50g daily serving',
      'Increased stomach cancer risk',
      'Higher cardiovascular disease mortality',
      'Type 2 diabetes association',
      'Increased all-cause mortality',
    ],
    threshold: 'WHO recommends limiting to occasional consumption. Ideal is under 2 servings per week.',
    sources: ['WHO IARC Monographs', 'World Cancer Research Fund', 'American Institute for Cancer Research'],
  },
  'Late Meals': {
    title: 'Late Night Eating',
    why: 'Eating late disrupts your circadian rhythm and metabolic processes. Your body is less efficient at processing food at night, leading to higher blood sugar spikes and impaired fat metabolism.',
    risks: [
      'Impaired glucose tolerance and insulin sensitivity',
      'Weight gain and difficulty losing weight',
      'Increased risk of type 2 diabetes',
      'Acid reflux and digestive issues',
      'Poor sleep quality',
      'Higher cardiovascular disease risk',
    ],
    threshold: 'Finish eating 2-3 hours before bed. Aim to complete dinner by 8pm for most people.',
    sources: ['Circadian Rhythm Research', 'Journal of Clinical Endocrinology', 'Sleep Foundation'],
  },
  'Avg Dinner': {
    title: 'Average Dinner Time',
    why: 'Your typical dinner time affects metabolic health, sleep quality, and weight management. Earlier dinner times align better with your circadian rhythm and give your body time to digest before sleep.',
    risks: [
      'Late dinners linked to weight gain',
      'Higher blood sugar levels when eating late',
      'Disrupted sleep patterns',
      'Increased acid reflux symptoms',
      'Reduced overnight fat burning',
    ],
    threshold: 'Optimal dinner time is between 5-7pm. Try to eat at least 3 hours before bedtime.',
    sources: ['Harvard Medical School', 'Cell Metabolism Journal', 'Obesity Research'],
  },
  'Hot Plastic': {
    title: 'Hot Plastic Containers',
    why: 'Heating food in plastic containers causes chemicals like BPA, phthalates, and microplastics to leach into your food. This is especially concerning with fatty or acidic foods.',
    risks: [
      'Endocrine disruption affecting hormones',
      'Increased risk of metabolic disorders',
      'Potential links to reproductive issues',
      'Association with certain cancers',
      'Developmental concerns in children',
    ],
    threshold: 'Aim for zero exposure. Use glass or ceramic containers for heating.',
    sources: ['WHO Guidelines on Plastics', 'Environmental Health Perspectives'],
  },
  'Ultra-Processed': {
    title: 'Ultra-Processed Foods',
    why: 'Ultra-processed foods (UPFs) contain industrial additives, preservatives, and undergo extensive processing. They typically have poor nutritional profiles and are engineered for overconsumption.',
    risks: [
      '30% increased risk of cardiovascular disease',
      'Higher rates of obesity and metabolic syndrome',
      'Increased risk of type 2 diabetes',
      'Association with depression and anxiety',
      'Potential links to colorectal cancer',
    ],
    threshold: 'Keep UPF consumption under 20% of total diet. Current average is over 60% in Western diets.',
    sources: ['BMJ 2024 Meta-Analysis', 'NOVA Food Classification'],
  },
  'Charred Foods': {
    title: 'Charred & Grilled Foods',
    why: 'High-temperature cooking creates heterocyclic amines (HCAs) and polycyclic aromatic hydrocarbons (PAHs) - compounds classified as probable carcinogens by the WHO.',
    risks: [
      'Increased colorectal cancer risk',
      'Association with pancreatic cancer',
      'Potential links to prostate cancer',
      'DNA damage from carcinogenic compounds',
    ],
    threshold: 'Limit charred/grilled meats to 2-3 times per week. Marinating and lower temperatures reduce risk.',
    sources: ['National Cancer Institute', 'IARC Monographs'],
  },
  'Fried Foods': {
    title: 'Fried Foods',
    why: 'Deep frying creates trans fats, acrylamide, and other harmful compounds. Repeated oil use multiplies these risks. Fried foods are also calorie-dense and promote inflammation.',
    risks: [
      '28% increased heart disease risk with daily consumption',
      'Higher rates of type 2 diabetes',
      'Increased inflammation markers',
      'Association with obesity',
      'Potential links to certain cancers',
    ],
    threshold: 'Limit to 1-2 servings per week. Air frying or baking are healthier alternatives.',
    sources: ['American Heart Association', 'BMJ Heart'],
  },
  'Sugary Drinks': {
    title: 'High-Sugar Beverages',
    why: 'Liquid sugar bypasses satiety signals, causes rapid blood sugar spikes, and provides empty calories. The body processes liquid sugar differently than sugar in whole foods.',
    risks: [
      '26% increased diabetes risk per daily serving',
      'Major contributor to obesity',
      'Increased cardiovascular disease risk',
      'Non-alcoholic fatty liver disease',
      'Tooth decay and dental problems',
    ],
    threshold: 'Aim for zero sugary drinks. Water, unsweetened tea, and black coffee are ideal.',
    sources: ['Harvard School of Public Health', 'American Diabetes Association'],
  },
  'Caffeine': {
    title: 'Caffeine Intake',
    why: 'While moderate caffeine has benefits, excessive intake disrupts sleep, increases anxiety, and can cause dependency. Timing matters - caffeine has a 6-hour half-life.',
    risks: [
      'Sleep disruption and insomnia',
      'Increased anxiety and restlessness',
      'Elevated blood pressure',
      'Dependency and withdrawal symptoms',
      'Potential bone density concerns at high levels',
    ],
    threshold: 'Keep under 400mg/day (about 4 cups of coffee). Avoid caffeine 6+ hours before bed.',
    sources: ['FDA Guidelines', 'Sleep Foundation'],
  },
  'Alcohol': {
    title: 'Alcohol Consumption',
    why: 'Alcohol is a Group 1 carcinogen. Even moderate consumption increases certain cancer risks. The "heart health benefits" have been largely debunked by recent research.',
    risks: [
      'Increased risk of 7 types of cancer',
      'Liver disease and damage',
      'Cardiovascular issues at higher intake',
      'Neurological effects and cognitive decline',
      'Mental health impacts',
    ],
    threshold: 'No amount is completely safe. If drinking, limit to 7 drinks/week for women, 14 for men.',
    sources: ['World Health Organization', 'Lancet 2023'],
  },
  'High Sodium': {
    title: 'High Sodium Foods',
    why: 'Excess sodium causes water retention, increases blood pressure, and strains the cardiovascular system. Most sodium comes from processed foods, not the salt shaker.',
    risks: [
      'Hypertension (high blood pressure)',
      'Increased stroke risk',
      'Heart disease and heart failure',
      'Kidney damage over time',
      'Stomach cancer association',
    ],
    threshold: 'Keep under 2,300mg/day (about 1 teaspoon). Ideal is under 1,500mg for most adults.',
    sources: ['American Heart Association', 'CDC Guidelines'],
  },
};

export default function InsightsPage() {
  const { meals, insights, isLoading } = useApp();
  const [selectedSignal, setSelectedSignal] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-sage-200 dark:border-sage-800 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-2 border-sage-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-warm-500 dark:text-neutral-400">Analyzing your patterns...</span>
        </div>
      </div>
    );
  }

  if (meals.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-900 dark:to-sage-800 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-sage-500" />
          </div>
          <h1 className="text-display text-3xl text-warm-900 dark:text-neutral-100 mb-3">No Data Yet</h1>
          <p className="text-warm-500 dark:text-neutral-400 mb-8 leading-relaxed">
            Start logging your meals to unlock powerful insights about your dietary patterns and health risks.
          </p>
          <Link href="/app" className="btn btn-primary btn-lg">
            Log Your First Meal
          </Link>
        </div>
      </div>
    );
  }

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

  // Calculate trend direction (mock - could be real with more data)
  const getTrend = (value: number, threshold: number) => {
    if (value < threshold * 0.7) return 'improving';
    if (value > threshold * 1.3) return 'concerning';
    return 'stable';
  };

  // Condensed signal data for the compact grid
  const signals = [
    { label: 'Hot Plastic', value: countFlag('plastic_container_hot'), icon: <Droplets className="w-5 h-5" />, concern: perDay(countFlag('plastic_container_hot')) > 0.3 },
    { label: 'Ultra-Processed', value: `${percent(countFlag('ultra_processed'))}%`, icon: <Package className="w-5 h-5" />, concern: percent(countFlag('ultra_processed')) > 50 },
    { label: 'Charred Foods', value: perWeek(countFlag('charred_grilled')).toFixed(1), icon: <Flame className="w-5 h-5" />, concern: perWeek(countFlag('charred_grilled')) > 4 },
    { label: 'Fried Foods', value: perWeek(countFlag('fried')).toFixed(1), icon: <UtensilsCrossed className="w-5 h-5" />, concern: perWeek(countFlag('fried')) > 5 },
    { label: 'Sugary Drinks', value: perDay(countFlag('high_sugar_beverage')).toFixed(1), icon: <GlassWater className="w-5 h-5" />, concern: perDay(countFlag('high_sugar_beverage')) > 1 },
    { label: 'Caffeine', value: perDay(countFlag('caffeine')).toFixed(1), icon: <Coffee className="w-5 h-5" />, concern: perDay(countFlag('caffeine')) > 4 },
    { label: 'Alcohol', value: perWeek(countFlag('alcohol')).toFixed(1), icon: <Wine className="w-5 h-5" />, concern: perWeek(countFlag('alcohol')) > 14 },
    { label: 'High Sodium', value: perDay(countFlag('high_sodium')).toFixed(1), icon: <Cylinder className="w-5 h-5" />, concern: perDay(countFlag('high_sodium')) > 1.2 },
  ];

  const concerningSignals = signals.filter(s => s.concern).length;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sage-50/50 via-transparent to-transparent dark:from-sage-950/30 dark:via-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-display text-4xl sm:text-5xl text-warm-900 dark:text-neutral-100 mb-2">
                Your Insights
              </h1>
              <p className="text-warm-500 dark:text-neutral-400 text-lg">
                {insights.totalMeals} meals analyzed over {daySpan} days
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1.5 rounded-full bg-warm-100 dark:bg-neutral-800 text-warm-600 dark:text-neutral-400">
                {insights.dateRange}
              </span>
            </div>
          </div>

          {/* Key Metrics - Large Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <MetricCard
              icon={<Droplets className="w-5 h-5" />}
              label="Plastic Exposure"
              value={insights.plastic.count}
              unit="bottles"
              trend={getTrend(insights.plastic.perDay, 0.5)}
              subtext={`${insights.plastic.perDay.toFixed(1)}/day`}
              concernLevel={insights.plastic.concernLevel}
              onClick={() => setSelectedSignal('Plastic Exposure')}
            />
            <MetricCard
              icon={<Beef className="w-5 h-5" />}
              label="Processed Meat"
              value={insights.processedMeat.perWeek.toFixed(1)}
              unit="/week"
              trend={getTrend(insights.processedMeat.perWeek, 3)}
              subtext={`${insights.processedMeat.count} total`}
              concernLevel={insights.processedMeat.concernLevel}
              onClick={() => setSelectedSignal('Processed Meat')}
            />
            <MetricCard
              icon={<Moon className="w-5 h-5" />}
              label="Late Meals"
              value={insights.mealTiming.lateMealPercent}
              unit="%"
              trend={getTrend(insights.mealTiming.lateMealPercent, 20)}
              subtext="after 9pm"
              concernLevel={insights.mealTiming.concernLevel}
              onClick={() => setSelectedSignal('Late Meals')}
            />
            <MetricCard
              icon={<Clock className="w-5 h-5" />}
              label="Avg Dinner"
              value={insights.mealTiming.avgDinnerTime.replace(' PM', '').replace(' AM', '')}
              unit={insights.mealTiming.avgDinnerTime.includes('PM') ? 'PM' : 'AM'}
              trend={insights.mealTiming.avgDinnerTime.includes('9:') || insights.mealTiming.avgDinnerTime.includes('10:') ? 'concerning' : 'stable'}
              subtext={insights.patterns.busiestDay}
              concernLevel={
                insights.mealTiming.avgDinnerTime.includes('10:') ||
                insights.mealTiming.avgDinnerTime.includes('11:') ||
                insights.mealTiming.avgDinnerTime.includes('9:')
                  ? 'moderate' : 'low'
              }
              onClick={() => setSelectedSignal('Avg Dinner')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

        {/* Bento Grid for Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Weekly Trend - Takes 2/3 width on large screens */}
          <div className="lg:col-span-2">
            <WeeklyTrendChart data={weeklyTrendData} />
          </div>

          {/* Flag Distribution - Takes 1/3 width */}
          <div className="lg:col-span-1">
            <FlagDistributionChart data={flagDistributionData} totalMeals={totalMeals} />
          </div>
        </div>

        {/* Meal Timing Comparison - Full Width */}
        <div className="mb-12">
          <MealTimingComparison data={enhancedTimingData} />
        </div>

        {/* Nutrition Radar - Conditional */}
        {nutritionBalanceData && (
          <div className="mb-12">
            <NutritionRadar data={nutritionBalanceData} />
          </div>
        )}

        {/* Quick Signals Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-warm-800 dark:text-neutral-200">
                Additional Signals
              </h2>
              <p className="text-sm text-warm-500 dark:text-neutral-400 mt-1">
                Quick overview of other dietary factors
              </p>
            </div>
            {concerningSignals > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                {concerningSignals} need attention
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {signals.map((signal) => (
              <button
                key={signal.label}
                onClick={() => setSelectedSignal(signal.label)}
                className={`
                  relative p-4 rounded-2xl text-center transition-all duration-200 shadow-sm cursor-pointer
                  ${signal.concern
                    ? 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/20 border border-rose-300 dark:border-rose-800/30'
                    : 'bg-white dark:bg-neutral-800/50 border border-warm-200 dark:border-neutral-700/50'
                  }
                  hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900
                `}
              >
                <div className={`mb-2 flex justify-center ${signal.concern ? 'text-rose-500 dark:text-rose-400' : 'text-warm-500 dark:text-neutral-500'}`}>{signal.icon}</div>
                <div className={`text-xl font-bold ${signal.concern ? 'text-rose-600 dark:text-rose-400' : 'text-warm-800 dark:text-neutral-200'}`}>
                  {signal.value}
                </div>
                <div className="text-xs text-warm-600 dark:text-neutral-400 mt-1 truncate">
                  {signal.label}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && signalDetails[selectedSignal] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSignal(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-neutral-900 px-6 pt-6 pb-4 border-b border-warm-100 dark:border-neutral-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-warm-900 dark:text-neutral-100">
                    {signalDetails[selectedSignal].title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedSignal(null)}
                  className="p-2 rounded-xl hover:bg-warm-100 dark:hover:bg-neutral-800 transition-colors text-warm-500 dark:text-neutral-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 space-y-6">
              {/* Why we track it */}
              <div>
                <h3 className="text-sm font-medium text-warm-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                  Why We Track This
                </h3>
                <p className="text-warm-700 dark:text-neutral-300 leading-relaxed">
                  {signalDetails[selectedSignal].why}
                </p>
              </div>

              {/* Health Risks */}
              <div>
                <h3 className="text-sm font-medium text-warm-500 dark:text-neutral-400 uppercase tracking-wide mb-3">
                  Associated Health Risks
                </h3>
                <ul className="space-y-2">
                  {signalDetails[selectedSignal].risks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                      <span className="text-warm-700 dark:text-neutral-300">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Threshold */}
              <div className="p-4 rounded-2xl bg-sage-50 dark:bg-sage-950/30 border border-sage-200 dark:border-sage-800/50">
                <h3 className="text-sm font-medium text-sage-700 dark:text-sage-400 mb-1">
                  Recommended Threshold
                </h3>
                <p className="text-sage-800 dark:text-sage-300">
                  {signalDetails[selectedSignal].threshold}
                </p>
              </div>

              {/* Sources */}
              <div className="pt-2">
                <h3 className="text-xs font-medium text-warm-400 dark:text-neutral-500 uppercase tracking-wide mb-2">
                  Sources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {signalDetails[selectedSignal].sources.map((source, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-warm-100 dark:bg-neutral-800 text-xs text-warm-600 dark:text-neutral-400"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  icon,
  label,
  value,
  unit,
  trend,
  subtext,
  concernLevel,
  onClick
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  trend: 'improving' | 'stable' | 'concerning';
  subtext: string;
  concernLevel: 'low' | 'moderate' | 'elevated';
  onClick?: () => void;
}) {
  const trendIcon = {
    improving: <TrendingDown className="w-4 h-4 text-emerald-500" />,
    stable: <Minus className="w-4 h-4 text-warm-400 dark:text-neutral-500" />,
    concerning: <TrendingUp className="w-4 h-4 text-rose-500" />,
  };

  const concernColors = {
    low: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    moderate: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    elevated: 'from-rose-500/10 to-rose-500/5 border-rose-500/20',
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl p-5 lg:p-6 text-left w-full
        bg-gradient-to-br ${concernColors[concernLevel]}
        border backdrop-blur-sm cursor-pointer
        transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900
      `}
    >
      {/* Icon badge */}
      <div className="flex items-center justify-between mb-4">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${concernLevel === 'low' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : ''}
          ${concernLevel === 'moderate' ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : ''}
          ${concernLevel === 'elevated' ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400' : ''}
        `}>
          {icon}
        </div>
        {trendIcon[trend]}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-display text-3xl lg:text-4xl text-warm-900 dark:text-neutral-100">
          {value}
        </span>
        <span className="text-warm-400 dark:text-neutral-500 text-sm ml-1">{unit}</span>
      </div>

      {/* Label & Subtext */}
      <div>
        <div className="font-medium text-warm-700 dark:text-neutral-300 text-sm">{label}</div>
        <div className="text-xs text-warm-400 dark:text-neutral-500 mt-0.5">{subtext}</div>
      </div>
    </button>
  );
}
