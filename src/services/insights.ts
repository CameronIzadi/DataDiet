import { Meal, Insights } from '../types';

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

export function calculateInsights(meals: Meal[]): Insights {
  if (meals.length === 0) {
    return {
      totalMeals: 0,
      dateRange: 'No data',
      plastic: { count: 0, perDay: 0, concernLevel: 'low' },
      processedMeat: { count: 0, perWeek: 0, concernLevel: 'low' },
      mealTiming: { lateMealPercent: 0, avgDinnerTime: 'N/A', concernLevel: 'low' },
      patterns: { busiestDay: 'N/A', weekendVsWeekday: 'N/A' }
    };
  }

  const totalMeals = meals.length;
  const daySpan = getDaySpan(meals);

  // Plastic exposure
  const plasticMeals = meals.filter(m => m.flags.includes('plastic_bottle'));
  const plasticCount = plasticMeals.length;
  const plasticPerDay = plasticCount / daySpan;

  // Processed meat
  const processedMeatMeals = meals.filter(m => m.flags.includes('processed_meat'));
  const processedMeatCount = processedMeatMeals.length;
  const processedMeatPerWeek = (processedMeatCount / daySpan) * 7;

  // Late meals (after 9pm or before 5am)
  const lateMeals = meals.filter(m => {
    const hour = new Date(m.loggedAt).getHours();
    return hour >= 21 || hour < 5;
  });
  const lateMealPercent = Math.round((lateMeals.length / totalMeals) * 100);

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
  const dayCount = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
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
  const weekendAvg = weekendMeals.length / 2; // 2 weekend days
  const weekdayAvg = weekdayMeals / 5; // 5 weekday days

  let weekendPattern = 'Similar patterns';
  if (weekendAvg > weekdayAvg * 1.2) {
    weekendPattern = 'More meals on weekends';
  } else if (weekdayAvg > weekendAvg * 1.2) {
    weekendPattern = 'More meals on weekdays';
  }

  return {
    totalMeals,
    dateRange: getDateRange(meals),
    plastic: {
      count: plasticCount,
      perDay: plasticPerDay,
      concernLevel: plasticPerDay > 1.5 ? 'elevated' : plasticPerDay > 0.5 ? 'moderate' : 'low'
    },
    processedMeat: {
      count: processedMeatCount,
      perWeek: processedMeatPerWeek,
      concernLevel: processedMeatPerWeek > 5 ? 'elevated' : processedMeatPerWeek > 3 ? 'moderate' : 'low'
    },
    mealTiming: {
      lateMealPercent,
      avgDinnerTime,
      concernLevel: lateMealPercent > 30 ? 'elevated' : lateMealPercent > 15 ? 'moderate' : 'low'
    },
    patterns: {
      busiestDay: getDayName(busiestDayIndex),
      weekendVsWeekday: weekendPattern
    }
  };
}

export function getInsightMessage(insights: Insights): string[] {
  const messages: string[] = [];

  if (insights.plastic.concernLevel !== 'low') {
    messages.push(
      `You consumed ${insights.plastic.count} plastic bottle beverages (${insights.plastic.perDay.toFixed(1)}/day). Consider switching to reusable bottles to reduce microplastic exposure.`
    );
  }

  if (insights.processedMeat.concernLevel !== 'low') {
    messages.push(
      `Processed meat consumption: ${insights.processedMeat.perWeek.toFixed(1)} servings/week. WHO recommends <3/week (Group 1 carcinogen classification).`
    );
  }

  if (insights.mealTiming.concernLevel !== 'low') {
    messages.push(
      `${insights.mealTiming.lateMealPercent}% of meals consumed after 9pm. Late eating is associated with disrupted sleep and metabolic issues.`
    );
  }

  return messages;
}
