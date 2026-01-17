import { Meal, Insights, SignalInsight, ConcernLevel } from '../types';

function getDaySpan(meals: Meal[]): number {
  if (meals.length === 0) return 1;
  const dates = meals.map(m => new Date(m.loggedAt).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daySpan = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;
  return daySpan;
}

function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const ampm = h >= 12 ? 'pm' : 'am';
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getDayName(dayIndex: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Unknown';
}

function getDateRange(meals: Meal[]): string {
  if (meals.length === 0) return 'No data';
  const dates = meals.map(m => new Date(m.loggedAt));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
}

// Helper to count meals with a specific flag
function countFlag(meals: Meal[], flag: string): number {
  return meals.filter(m => m.flags.includes(flag)).length;
}

// Helper to create a basic signal insight
function createSignalInsight(
  count: number,
  daySpan: number,
  totalMeals: number,
  thresholds: { moderate: number; elevated: number },
  metric: 'perDay' | 'perWeek' | 'percent'
): SignalInsight {
  let value: number;
  let concernLevel: ConcernLevel;

  switch (metric) {
    case 'perDay':
      value = count / daySpan;
      concernLevel = value > thresholds.elevated ? 'elevated' : value > thresholds.moderate ? 'moderate' : 'low';
      return { count, perDay: value, concernLevel };
    case 'perWeek':
      value = (count / daySpan) * 7;
      concernLevel = value > thresholds.elevated ? 'elevated' : value > thresholds.moderate ? 'moderate' : 'low';
      return { count, perWeek: value, concernLevel };
    case 'percent':
      value = totalMeals > 0 ? Math.round((count / totalMeals) * 100) : 0;
      concernLevel = value > thresholds.elevated ? 'elevated' : value > thresholds.moderate ? 'moderate' : 'low';
      return { count, percent: value, concernLevel };
  }
}

// Empty insight for when there's no data
function emptyInsight(): SignalInsight {
  return { count: 0, perDay: 0, perWeek: 0, percent: 0, concernLevel: 'low' };
}

export function calculateInsights(meals: Meal[]): Insights {
  if (meals.length === 0) {
    return {
      totalMeals: 0,
      dateRange: 'No data',
      daysTracked: 0,
      plastic: emptyInsight(),
      plasticHot: emptyInsight(),
      processedMeat: emptyInsight(),
      charredGrilled: emptyInsight(),
      ultraProcessed: emptyInsight(),
      highSugarBeverage: emptyInsight(),
      caffeine: { ...emptyInsight(), lateCount: 0 },
      alcohol: emptyInsight(),
      friedFood: emptyInsight(),
      refinedGrain: emptyInsight(),
      highSodium: emptyInsight(),
      spicyIrritant: emptyInsight(),
      acidicTrigger: emptyInsight(),
      lateMeal: { ...emptyInsight(), avgDinnerTime: 'N/A' },
      patterns: { busiestDay: 'N/A', weekendVsWeekday: 'N/A' },
    };
  }

  const totalMeals = meals.length;
  const daySpan = getDaySpan(meals);

  // Count all flags
  const plasticCount = countFlag(meals, 'plastic') + countFlag(meals, 'plastic_bottle');
  const plasticHotCount = countFlag(meals, 'plastic_container_hot');
  const processedMeatCount = countFlag(meals, 'processed_meat');
  const charredGrilledCount = countFlag(meals, 'charred_grilled') + countFlag(meals, 'charred');
  const ultraProcessedCount = countFlag(meals, 'ultra_processed');
  const highSugarBeverageCount = countFlag(meals, 'high_sugar_beverage');
  const caffeineCount = countFlag(meals, 'caffeine');
  const alcoholCount = countFlag(meals, 'alcohol');
  const friedFoodCount = countFlag(meals, 'fried_food') + countFlag(meals, 'fried');
  const refinedGrainCount = countFlag(meals, 'refined_grain');
  const highSodiumCount = countFlag(meals, 'high_sodium');
  const spicyIrritantCount = countFlag(meals, 'spicy_irritant');
  const acidicTriggerCount = countFlag(meals, 'acidic_trigger');
  const lateMealCount = countFlag(meals, 'late_meal');

  // Late caffeine (after 2pm) - important for sleep quality
  const lateCaffeineCount = meals.filter(m => {
    if (!m.flags.includes('caffeine')) return false;
    const hour = new Date(m.loggedAt).getHours();
    return hour >= 14; // After 2pm
  }).length;

  // Average dinner time (meals between 5pm-11pm)
  const dinnerMeals = meals.filter(m => {
    const hour = new Date(m.loggedAt).getHours();
    return hour >= 17 && hour <= 23;
  });

  let avgDinnerTime = 'N/A';
  if (dinnerMeals.length > 0) {
    const avgHour = dinnerMeals.reduce((sum, m) => {
      const date = new Date(m.loggedAt);
      return sum + date.getHours() + date.getMinutes() / 60;
    }, 0) / dinnerMeals.length;
    avgDinnerTime = formatTime(avgHour);
  }

  // Day of week patterns
  const dayCount = [0, 0, 0, 0, 0, 0, 0];
  meals.forEach(m => {
    dayCount[new Date(m.loggedAt).getDay()]++;
  });
  const busiestDayIndex = dayCount.indexOf(Math.max(...dayCount));

  // Weekend vs weekday
  const weekendMeals = meals.filter(m => {
    const day = new Date(m.loggedAt).getDay();
    return day === 0 || day === 6;
  });
  const weekdayMeals = meals.length - weekendMeals.length;
  const weekendAvg = weekendMeals.length / 2;
  const weekdayAvg = weekdayMeals / 5;

  let weekendPattern = 'Similar patterns';
  if (weekendAvg > weekdayAvg * 1.2) {
    weekendPattern = 'More meals on weekends';
  } else if (weekdayAvg > weekendAvg * 1.2) {
    weekendPattern = 'More meals on weekdays';
  }

  return {
    totalMeals,
    dateRange: getDateRange(meals),
    daysTracked: daySpan,

    // PLASTIC BOTTLES
    // Research: Bottled water = ~90,000 additional microplastics/year vs 4,000 from tap water
    // No official safe limit exists, but minimizing exposure is recommended
    // Source: https://pubmed.ncbi.nlm.nih.gov/39431565/
    plastic: createSignalInsight(plasticCount, daySpan, totalMeals, { moderate: 0.5, elevated: 1 }, 'perDay'),

    // HOT FOOD IN PLASTIC
    // Research: Heat significantly increases plastic leaching and microplastic release
    // Any exposure is concerning - avoid microwaving in plastic containers
    // Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC12474263/
    plasticHot: createSignalInsight(plasticHotCount, daySpan, totalMeals, { moderate: 0.15, elevated: 0.3 }, 'perDay'),

    // PROCESSED MEAT
    // Research: WHO/IARC Group 1 carcinogen. 18% increased colorectal cancer risk per 50g/day
    // WCRF recommends: avoid entirely or limit to <3 servings/week
    // Source: https://www.who.int/news-room/questions-and-answers/item/cancer-carcinogenicity-of-the-consumption-of-red-meat-and-processed-meat
    processedMeat: createSignalInsight(processedMeatCount, daySpan, totalMeals, { moderate: 2, elevated: 3 }, 'perWeek'),

    // CHARRED/GRILLED
    // Research: Creates heterocyclic amines (HCAs) and polycyclic aromatic hydrocarbons (PAHs)
    // Associated with increased cancer risk. Trim charred portions.
    charredGrilled: createSignalInsight(charredGrilledCount, daySpan, totalMeals, { moderate: 2, elevated: 4 }, 'perWeek'),

    // ULTRA-PROCESSED FOODS
    // Research: Average American consumes 55% of calories from UPF. Each 100g/day = 2.6% mortality increase
    // 14.5% higher hypertension risk, 5.9% increased cardiovascular events per 100g/day
    // Target: <30% of meals. Average American is at 55%.
    // Source: https://pubmed.ncbi.nlm.nih.gov/38418082/, https://www.cdc.gov/nchs/products/databriefs/db536.htm
    ultraProcessed: createSignalInsight(ultraProcessedCount, daySpan, totalMeals, { moderate: 30, elevated: 50 }, 'percent'),

    // HIGH SUGAR BEVERAGES
    // Research: Strong link to obesity, type 2 diabetes, metabolic syndrome
    // Associated with highest mortality risk among ultra-processed foods
    // Source: https://hsph.harvard.edu/news/ultra-processed-foods-some-more-than-others-linked-to-early-death/
    highSugarBeverage: createSignalInsight(highSugarBeverageCount, daySpan, totalMeals, { moderate: 0.5, elevated: 1 }, 'perDay'),

    // CAFFEINE
    // Research: FDA recommends max 400mg/day (~4 cups coffee). Avoid after 2pm for sleep quality.
    // Pregnant women: limit to 200mg/day
    // Source: https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much
    caffeine: {
      ...createSignalInsight(caffeineCount, daySpan, totalMeals, { moderate: 3, elevated: 4 }, 'perDay'),
      lateCount: lateCaffeineCount,
    },

    // ALCOHOL
    // Research: CDC moderate drinking = 1/day women, 2/day men
    // Heavy drinking = 8+/week women, 15+/week men. Accounts for 6% of US cancers.
    // Source: https://www.cdc.gov/alcohol/about-alcohol-use/moderate-alcohol-use.html
    alcohol: createSignalInsight(alcoholCount, daySpan, totalMeals, { moderate: 7, elevated: 14 }, 'perWeek'),

    // FRIED FOODS
    // Research: Associated with heart disease, inflammation, and obesity
    // Linked to increased cardiovascular mortality
    friedFood: createSignalInsight(friedFoodCount, daySpan, totalMeals, { moderate: 3, elevated: 5 }, 'perWeek'),

    // REFINED GRAINS
    // Research: Associated with higher cardiovascular risk vs whole grains
    // Aim for majority whole grains. Average American diet is heavy in refined grains.
    refinedGrain: createSignalInsight(refinedGrainCount, daySpan, totalMeals, { moderate: 40, elevated: 60 }, 'percent'),

    // HIGH SODIUM
    // Research: FDA recommends <2,300mg/day, AHA ideal <1,500mg/day
    // Average American: 3,400mg/day. 70%+ comes from processed/packaged foods
    // Source: https://www.fda.gov/food/nutrition-education-resources-materials/sodium-your-diet
    highSodium: createSignalInsight(highSodiumCount, daySpan, totalMeals, { moderate: 0.7, elevated: 1.2 }, 'perDay'),

    // SPICY IRRITANTS (for gut issues)
    // Individual tolerance varies. Track for those with IBS, IBD, or gut sensitivity
    spicyIrritant: createSignalInsight(spicyIrritantCount, daySpan, totalMeals, { moderate: 4, elevated: 7 }, 'perWeek'),

    // ACIDIC TRIGGERS (for reflux)
    // Individual tolerance varies. Track for those with GERD or acid reflux
    acidicTrigger: createSignalInsight(acidicTriggerCount, daySpan, totalMeals, { moderate: 4, elevated: 7 }, 'perWeek'),

    // LATE MEALS
    // Research: Eating after 9pm or within 3 hours of sleep associated with:
    // - 2-3x obesity risk, metabolic syndrome, impaired glucose tolerance
    // - 10% slower fat metabolism, disrupted circadian rhythm
    // Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC7337187/
    lateMeal: {
      ...createSignalInsight(lateMealCount, daySpan, totalMeals, { moderate: 15, elevated: 25 }, 'percent'),
      avgDinnerTime,
    },

    patterns: {
      busiestDay: getDayName(busiestDayIndex),
      weekendVsWeekday: weekendPattern,
    },
  };
}

export function getInsightMessage(insights: Insights): string[] {
  const messages: string[] = [];

  if (insights.plastic.concernLevel !== 'low') {
    messages.push(
      `You consumed ${insights.plastic.count} plastic bottle beverages (${insights.plastic.perDay?.toFixed(1)}/day). Consider switching to reusable bottles to reduce microplastic exposure.`
    );
  }

  if (insights.processedMeat.concernLevel !== 'low') {
    messages.push(
      `Processed meat consumption: ${insights.processedMeat.perWeek?.toFixed(1)} servings/week. WHO recommends <3/week (Group 1 carcinogen classification).`
    );
  }

  if (insights.lateMeal.concernLevel !== 'low') {
    messages.push(
      `${insights.lateMeal.percent}% of meals consumed after 9pm. Late eating is associated with disrupted sleep and metabolic issues.`
    );
  }

  if (insights.caffeine.lateCount > 0) {
    messages.push(
      `${insights.caffeine.lateCount} caffeinated drinks consumed after 2pm. This may affect sleep quality.`
    );
  }

  if (insights.alcohol.concernLevel !== 'low') {
    messages.push(
      `Alcohol consumption: ${insights.alcohol.perWeek?.toFixed(1)} drinks/week. Consider moderation for better health outcomes.`
    );
  }

  return messages;
}
