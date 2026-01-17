'use client';

import { useApp } from '@/context/AppContext';
import { InsightCard } from '@/components/InsightCard';
import { MealTimingChart } from '@/components/MealTimingChart';
import { getMealTimingDistribution } from '@/services/insights';
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

      {/* Meal Timing Distribution */}
      <div className="mb-10">
        <MealTimingChart data={timingDistribution} />
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

