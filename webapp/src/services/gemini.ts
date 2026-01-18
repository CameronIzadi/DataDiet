// Gemini AI Service for food analysis and report generation
// All API calls go through server-side route to protect API key

import { GeminiFoodAnalysis, Meal, Insights, BloodWork } from '@/types';

/**
 * Call the server-side Gemini API route
 */
async function callGeminiAPI(action: string, data: Record<string, unknown>): Promise<string> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, data }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Failed to process request');
  }

  const { result } = await response.json();
  return result;
}

/**
 * Analyze a meal image using Gemini Vision
 */
export async function analyzeFoodImage(base64Image: string): Promise<GeminiFoodAnalysis> {
  const prompt = `Analyze this meal image carefully. Return ONLY valid JSON with no markdown formatting:

{
  "foods": [
    {"name": "food name", "portion": "estimated portion", "container": "plastic_bottle|glass|can|none"}
  ],
  "flags": ["array of applicable flags"],
  "estimated_nutrition": {
    "calories": number,
    "protein": number (grams),
    "carbs": number (grams),
    "fat": number (grams),
    "sodium": number (mg)
  }
}

Flag rules - include if applicable:
- "plastic_bottle": ANY beverage in plastic container (bottled water, soda, juice, etc.)
- "processed_meat": bacon, sausage, hot dog, ham, salami, pepperoni, deli meat, cured meats
- "high_sodium": estimated sodium > 1000mg for the meal
- "ultra_processed": frozen meals, fast food, heavily packaged snacks, instant noodles

Be thorough in identifying containers. If you see ANY plastic bottle, flag it.
Return ONLY the JSON, no explanation.`;

  try {
    const responseText = await callGeminiAPI('analyzeImage', { base64Image, prompt });
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini food analysis error:', error);
    throw new Error('Failed to analyze food image');
  }
}

/**
 * Generate a professional clinical dietary pattern report for healthcare providers
 */
export async function generateDoctorReport(
  meals: Meal[],
  insights: Insights,
  bloodWork?: BloodWork
): Promise<string> {
  const mealTimingData = getMealTimingDistribution(meals);
  const flagData = getFlagDistribution(meals);
  const highSodiumCount = meals.filter(m => m.flags.includes('high_sodium')).length;
  const ultraProcessedCount = meals.filter(m => m.flags.includes('ultra_processed')).length;
  const frequentFoods = getMostFrequentFoods(meals);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const prompt = `You are a board-certified clinical nutritionist at a leading medical institution. Generate a comprehensive dietary pattern analysis report that will be shared with the patient's healthcare provider.

Write in authoritative, professional clinical language. Use precise medical terminology. Be thorough but concise.

===== PATIENT DIETARY SURVEILLANCE DATA =====

Report Generated: ${today}
Analysis Period: ${insights.dateRange}
Total Meals Documented: ${insights.totalMeals}
Data Completeness Score: ${Math.min(100, Math.round((insights.totalMeals / 56) * 100))}%

PRIMARY METRICS:
• Processed Meat Intake: ${insights.processedMeat.count} servings total (${insights.processedMeat.perWeek.toFixed(1)} servings/week)
• Late-Night Eating (>21:00): ${insights.mealTiming.lateMealPercent}% of meals
• Single-Use Plastic Exposure: ${insights.plastic.count} instances (${insights.plastic.perDay.toFixed(2)}/day)
• Mean Evening Meal Time: ${insights.mealTiming.avgDinnerTime}
• High-Sodium Meals Flagged: ${highSodiumCount}
• Ultra-Processed Food Consumption: ${ultraProcessedCount} meals

CHRONOBIOLOGICAL DISTRIBUTION:
• Morning (0600-1100): ${mealTimingData[0]?.percent || 0}%
• Midday (1100-1500): ${mealTimingData[1]?.percent || 0}%
• Evening (1500-2100): ${mealTimingData[2]?.percent || 0}%
• Late Night (>2100): ${mealTimingData[3]?.percent || 0}%

BEHAVIORAL PATTERN: ${insights.patterns.weekendVsWeekday}

DIETARY FLAGS IDENTIFIED: ${flagData.slice(0, 6).map(f => `${f.name} (n=${f.value})`).join(', ') || 'None identified'}

FREQUENTLY CONSUMED ITEMS: ${frequentFoods.slice(0, 8).map(f => f.name).join(', ') || 'Insufficient data'}
${bloodWork ? `
LABORATORY VALUES (Specimen Date: ${bloodWork.testDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}):
• Total Cholesterol: ${bloodWork.totalCholesterol} mg/dL [Reference: <200 mg/dL] ${bloodWork.totalCholesterol >= 240 ? '— ELEVATED' : bloodWork.totalCholesterol >= 200 ? '— BORDERLINE HIGH' : '— WITHIN NORMAL LIMITS'}
• LDL Cholesterol: ${bloodWork.ldl} mg/dL [Reference: <100 mg/dL optimal] ${bloodWork.ldl >= 160 ? '— ELEVATED' : bloodWork.ldl >= 130 ? '— BORDERLINE HIGH' : '— OPTIMAL'}
• HDL Cholesterol: ${bloodWork.hdl} mg/dL [Reference: >40 mg/dL] ${bloodWork.hdl < 40 ? '— LOW' : bloodWork.hdl >= 60 ? '— OPTIMAL/PROTECTIVE' : '— WITHIN NORMAL LIMITS'}
• Triglycerides: ${bloodWork.triglycerides} mg/dL [Reference: <150 mg/dL] ${bloodWork.triglycerides >= 200 ? '— ELEVATED' : bloodWork.triglycerides >= 150 ? '— BORDERLINE HIGH' : '— WITHIN NORMAL LIMITS'}
• Fasting Glucose: ${bloodWork.fastingGlucose} mg/dL [Reference: <100 mg/dL] ${bloodWork.fastingGlucose >= 126 ? '— DIABETIC RANGE' : bloodWork.fastingGlucose >= 100 ? '— PREDIABETIC/IFG' : '— WITHIN NORMAL LIMITS'}` : ''}

===== GENERATE REPORT WITH THIS EXACT STRUCTURE =====

# Dietary Pattern Analysis Report

**Patient Report** | Generated ${today}
**Analysis Period:** ${insights.dateRange} | **Meals Analyzed:** ${insights.totalMeals}

---

## Executive Summary

Write a compelling 4-5 sentence clinical summary. Open with the most significant finding. Quantify the key risk factors. Note any patterns requiring clinical attention. End with a statement about overall dietary risk profile. Use authoritative clinical tone.

---

## Clinical Findings Overview

Create this exact table with professional status indicators:

| Parameter | Observed Value | Clinical Threshold | Status |
|:----------|:---------------|:-------------------|:-------|
| Processed Meat Consumption | ${insights.processedMeat.perWeek.toFixed(1)} servings/week | <3 servings/week | ${insights.processedMeat.concernLevel === 'elevated' ? '⚠️ Elevated' : insights.processedMeat.concernLevel === 'moderate' ? '⚡ Monitor' : '✓ Acceptable'} |
| Late-Night Eating | ${insights.mealTiming.lateMealPercent}% of meals | <15% | ${insights.mealTiming.concernLevel === 'elevated' ? '⚠️ Elevated' : insights.mealTiming.concernLevel === 'moderate' ? '⚡ Monitor' : '✓ Acceptable'} |
| Plastic Container Exposure | ${insights.plastic.count} exposures | Minimize | ${insights.plastic.concernLevel === 'elevated' ? '⚠️ Elevated' : insights.plastic.concernLevel === 'moderate' ? '⚡ Monitor' : '✓ Low'} |
| Evening Meal Timing | ${insights.mealTiming.avgDinnerTime} | Before 20:00 | Note |

---

## Detailed Clinical Analysis

### 1. Processed Meat Consumption

**Observed Pattern:** ${insights.processedMeat.perWeek.toFixed(1)} servings per week (${insights.processedMeat.count} total servings during analysis period)

**Clinical Significance:** The World Health Organization International Agency for Research on Cancer (IARC) classifies processed meat as a Group 1 carcinogen. Meta-analyses demonstrate a dose-dependent relationship with colorectal cancer risk (18% increased risk per 50g/day). Additionally, processed meat consumption is independently associated with cardiovascular disease, type 2 diabetes, and all-cause mortality.

**Pattern Analysis:** ${insights.patterns.weekendVsWeekday}. Describe any temporal clustering observed.

---

### 2. Circadian Eating Patterns

**Observed Pattern:** ${insights.mealTiming.lateMealPercent}% of documented meals consumed after 21:00. Mean dinner time: ${insights.mealTiming.avgDinnerTime}.

**Chronobiological Distribution:**
- Morning (0600-1100): ${mealTimingData[0]?.percent || 0}%
- Midday (1100-1500): ${mealTimingData[1]?.percent || 0}%
- Evening (1500-2100): ${mealTimingData[2]?.percent || 0}%
- Late Night (>2100): ${mealTimingData[3]?.percent || 0}%

**Clinical Significance:** Late eating disrupts circadian glucose regulation and has been associated with impaired glucose tolerance, elevated triglycerides, reduced diet-induced thermogenesis, and compromised sleep architecture. Time-restricted eating protocols suggest optimal metabolic outcomes when the eating window concludes by 20:00.

---

### 3. Environmental Exposure Assessment

**Observed Pattern:** ${insights.plastic.count} documented exposures to single-use plastic containers (${insights.plastic.perDay.toFixed(2)} per day average)

**Clinical Significance:** Emerging literature suggests microplastic ingestion and BPA/phthalate exposure may contribute to endocrine disruption, metabolic dysfunction, and oxidative stress. While definitive causal relationships remain under investigation, the precautionary principle supports minimizing exposure where feasible.

---
${highSodiumCount > 0 ? `
### 4. Sodium Intake Assessment

**Observed Pattern:** ${highSodiumCount} meals flagged for elevated sodium content

**Clinical Significance:** Excessive sodium intake is a modifiable risk factor for hypertension, cardiovascular disease, and stroke. Current dietary guidelines recommend <2,300 mg/day, with optimal intake at 1,500 mg/day for adults with hypertension or prehypertension.

---` : ''}
${bloodWork ? `
## Laboratory Correlation Analysis

| Biomarker | Result | Reference Range | Interpretation |
|:----------|:-------|:----------------|:---------------|
| Total Cholesterol | ${bloodWork.totalCholesterol} mg/dL | <200 mg/dL | ${bloodWork.totalCholesterol >= 240 ? 'Elevated' : bloodWork.totalCholesterol >= 200 ? 'Borderline High' : 'Desirable'} |
| LDL Cholesterol | ${bloodWork.ldl} mg/dL | <100 mg/dL | ${bloodWork.ldl >= 160 ? 'High' : bloodWork.ldl >= 130 ? 'Borderline High' : 'Near Optimal'} |
| HDL Cholesterol | ${bloodWork.hdl} mg/dL | >40 mg/dL | ${bloodWork.hdl < 40 ? 'Low (CVD Risk Factor)' : bloodWork.hdl >= 60 ? 'Optimal (Cardioprotective)' : 'Acceptable'} |
| Triglycerides | ${bloodWork.triglycerides} mg/dL | <150 mg/dL | ${bloodWork.triglycerides >= 200 ? 'High' : bloodWork.triglycerides >= 150 ? 'Borderline High' : 'Normal'} |
| Fasting Glucose | ${bloodWork.fastingGlucose} mg/dL | <100 mg/dL | ${bloodWork.fastingGlucose >= 126 ? 'Diabetic Range' : bloodWork.fastingGlucose >= 100 ? 'Impaired Fasting Glucose' : 'Normal'} |

### Diet-Biomarker Correlations

Analyze specific mechanistic links between the observed dietary patterns and laboratory findings. For each abnormal lab value, explain how the dietary behaviors may be contributing. Be specific and evidence-based.

---` : ''}

## Clinical Recommendations

Based on the dietary surveillance data, the following interventions merit discussion with the patient:

Provide 4-5 specific, prioritized, evidence-based recommendations. Each should include:
1. The specific behavior change
2. A measurable target
3. Brief rationale
4. Expected clinical benefit

Format as numbered list with bold action items.

---

## Data Quality & Limitations

- **Documentation Rate:** ${Math.min(100, Math.round((insights.totalMeals / 56) * 100))}% of expected meals captured
- **Analysis Period:** ${insights.dateRange}
- **Sample Size:** ${insights.totalMeals} meals
- **Methodology:** AI-assisted dietary pattern recognition with passive meal logging
- **Limitations:** Portion size estimation variability; potential recall/documentation bias; image recognition accuracy dependent on photo quality

---

*This report was generated by DataDiet's AI-powered dietary surveillance platform. It is intended to facilitate clinical discussion and does not constitute medical advice or diagnosis. All clinical decisions should be made by qualified healthcare providers based on comprehensive patient evaluation.*

**Report ID:** RPT-${Date.now().toString(36).toUpperCase()}

===== END STRUCTURE =====

Generate the complete report now. Ensure all sections are thorough and clinically authoritative.`;

  try {
    const result = await callGeminiAPI('generateReport', { prompt });
    return result;
  } catch (error) {
    console.error('Report generation error:', error);
    throw new Error('Failed to generate doctor report');
  }
}

/**
 * Helper: Get most frequent foods from meals
 */
function getMostFrequentFoods(meals: Meal[]): { name: string; count: number }[] {
  const foodCounts: Record<string, number> = {};

  meals.forEach(meal => {
    meal.foods.forEach(food => {
      const name = food.name.toLowerCase();
      foodCounts[name] = (foodCounts[name] || 0) + 1;
    });
  });

  return Object.entries(foodCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Helper: Get meal timing distribution for report
 */
function getMealTimingDistribution(meals: Meal[]): { label: string; percent: number }[] {
  if (meals.length === 0) {
    return [
      { label: 'Morning (6am-11am)', percent: 0 },
      { label: 'Midday (11am-3pm)', percent: 0 },
      { label: 'Evening (3pm-9pm)', percent: 0 },
      { label: 'Late (9pm+)', percent: 0 },
    ];
  }

  const morning = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 6 && h < 11;
  }).length;

  const midday = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 11 && h < 15;
  }).length;

  const evening = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 15 && h < 21;
  }).length;

  const late = meals.filter(m => {
    const h = new Date(m.loggedAt).getHours();
    return h >= 21 || h < 6;
  }).length;

  const total = meals.length || 1;

  return [
    { label: 'Morning (6am-11am)', percent: Math.round((morning / total) * 100) },
    { label: 'Midday (11am-3pm)', percent: Math.round((midday / total) * 100) },
    { label: 'Evening (3pm-9pm)', percent: Math.round((evening / total) * 100) },
    { label: 'Late (9pm+)', percent: Math.round((late / total) * 100) },
  ];
}

/**
 * Helper: Get flag distribution for report
 */
function getFlagDistribution(meals: Meal[]): { name: string; value: number; flag: string }[] {
  if (meals.length === 0) return [];

  const flagLabels: Record<string, string> = {
    processed_meat: 'Processed Meat',
    ultra_processed: 'Ultra-Processed',
    charred_grilled: 'Charred/Grilled',
    fried: 'Fried Foods',
    late_meal: 'Late Meals',
    caffeine: 'Caffeine',
    plastic_bottle: 'Plastic Bottles',
    plastic_container_hot: 'Hot Plastic',
    high_sugar_beverage: 'Sugary Drinks',
    alcohol: 'Alcohol',
    high_sodium: 'High Sodium',
    refined_grain: 'Refined Grains',
    spicy_irritant: 'Spicy Foods',
    acidic_trigger: 'Acidic Foods',
  };

  const flagCounts = new Map<string, number>();

  meals.forEach(meal => {
    meal.flags.forEach(flag => {
      flagCounts.set(flag, (flagCounts.get(flag) || 0) + 1);
    });
  });

  return Array.from(flagCounts.entries())
    .map(([flag, value]) => ({
      name: flagLabels[flag] || flag,
      value,
      flag,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Helper: Get weekly pattern summary for report
 */
function getWeeklyPattern(meals: Meal[]): string {
  if (meals.length === 0) return 'No data available';

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayData: { meals: number; late: number; flags: number }[] = Array(7).fill(null).map(() => ({ meals: 0, late: 0, flags: 0 }));

  meals.forEach(meal => {
    const date = new Date(meal.loggedAt);
    const day = date.getDay();
    const hour = date.getHours();

    dayData[day].meals++;
    if (hour >= 21 || hour < 5) dayData[day].late++;
    dayData[day].flags += meal.flags.length;
  });

  return dayData.map((data, index) => {
    const bar = '█'.repeat(Math.min(data.meals, 5));
    return `${dayNames[index].substring(0, 3)}: ${bar.padEnd(5, '░')} (${data.meals} meals, ${data.late} late)`;
  }).join('\n');
}

/**
 * Analyze text description of a meal (fallback if no image)
 */
export async function analyzeFoodText(description: string): Promise<GeminiFoodAnalysis> {
  const prompt = `Analyze this meal description and return ONLY valid JSON:

Meal description: "${description}"

{
  "foods": [
    {"name": "food name", "portion": "estimated portion", "container": "plastic_bottle|glass|can|none"}
  ],
  "flags": ["array of applicable flags"],
  "estimated_nutrition": {
    "calories": number,
    "protein": number (grams),
    "carbs": number (grams),
    "fat": number (grams),
    "sodium": number (mg)
  }
}

Flag rules:
- "plastic_bottle": beverage mentioned with plastic bottle
- "processed_meat": bacon, sausage, hot dog, ham, salami, pepperoni, deli meat
- "high_sodium": estimated sodium > 1000mg
- "ultra_processed": frozen meals, fast food, packaged snacks

Return ONLY the JSON.`;

  try {
    const responseText = await callGeminiAPI('analyzeText', { prompt });
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini text analysis error:', error);
    throw new Error('Failed to analyze meal description');
  }
}
