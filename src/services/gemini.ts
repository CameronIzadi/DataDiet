// Gemini AI Service for food analysis and report generation

import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiFoodAnalysis, Meal, Insights, BloodWork } from '@/types';

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY'
);

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
    ]);

    const responseText = result.response.text();
    // Clean up any markdown formatting
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini food analysis error:', error);
    throw new Error('Failed to analyze food image');
  }
}

/**
 * Generate a doctor-ready report from meal data and insights
 */
export async function generateDoctorReport(
  meals: Meal[],
  insights: Insights,
  bloodWork?: BloodWork
): Promise<string> {
  const prompt = `Generate a professional dietary pattern report for a physician. Write in clear, clinical language.

PATIENT DIETARY DATA:
- Reporting period: ${insights.dateRange}
- Total meals logged: ${insights.totalMeals}
- Plastic bottle beverages: ${insights.plastic.count} (${insights.plastic.perDay.toFixed(1)}/day average)
- Processed meat servings: ${insights.processedMeat.count} (${insights.processedMeat.perWeek.toFixed(1)}/week)
- Meals after 9pm: ${insights.mealTiming.lateMealPercent}%
- Average dinner time: ${insights.mealTiming.avgDinnerTime}
- Pattern: ${insights.patterns.weekendVsWeekday}

${bloodWork ? `
BLOOD WORK (${bloodWork.testDate.toLocaleDateString()}):
- Total Cholesterol: ${bloodWork.totalCholesterol} mg/dL ${bloodWork.totalCholesterol > 200 ? '(ELEVATED)' : ''}
- LDL Cholesterol: ${bloodWork.ldl} mg/dL ${bloodWork.ldl > 130 ? '(ELEVATED)' : ''}
- HDL Cholesterol: ${bloodWork.hdl} mg/dL ${bloodWork.hdl < 40 ? '(LOW)' : ''}
- Triglycerides: ${bloodWork.triglycerides} mg/dL ${bloodWork.triglycerides > 150 ? '(ELEVATED)' : ''}
- Fasting Glucose: ${bloodWork.fastingGlucose} mg/dL ${bloodWork.fastingGlucose > 100 ? '(BORDERLINE/ELEVATED)' : ''}
` : 'No blood work provided.'}

TOP 10 MOST FREQUENT FOODS:
${getMostFrequentFoods(meals).map((f, i) => `${i + 1}. ${f.name} (${f.count}x)`).join('\n')}

Write a structured report with these sections:

## Executive Summary
3-4 sentences summarizing the key dietary patterns and health implications.

## Key Findings
Bullet points of the most clinically relevant patterns found.

## Dietary Pattern Analysis
Brief discussion of meal timing, food choices, and notable patterns.

${bloodWork ? `## Blood Work Correlations
Specific potential links between the dietary patterns and the blood work results.` : ''}

## Discussion Points for Patient
2-3 specific, actionable topics to discuss with the patient.

Use professional medical language. Be factual, not alarmist. Focus on patterns, not individual meals.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
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
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini text analysis error:', error);
    throw new Error('Failed to analyze meal description');
  }
}

