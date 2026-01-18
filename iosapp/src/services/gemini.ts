import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

console.log('Gemini API Key loaded:', API_KEY ? `${API_KEY.substring(0, 8)}...` : 'MISSING');

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

export interface FoodItem {
  name: string;
  portion: string;
  container?: 'plastic_bottle' | 'glass' | 'can' | 'none';
}

export interface FoodAnalysis {
  foods: FoodItem[];
  flags: string[];
  estimated_nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sodium: number;
  };
}

export async function analyzeFood(base64Image: string): Promise<FoodAnalysis> {
  const prompt = `Analyze this meal image. Return ONLY valid JSON with no markdown formatting:
{
  "foods": [{"name": "string", "portion": "string", "container": "plastic_bottle|glass|can|none"}],
  "flags": [],
  "estimated_nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number}
}

Apply these flags when detected (only include applicable ones):

PLASTIC & CONTAINERS:
- "plastic_bottle": beverage in plastic bottle (water, soda, juice, sports drink)
- "plastic_container_hot": hot food served in plastic container (takeout, microwave meals)

PROCESSED FOODS:
- "processed_meat": bacon, sausage, hot dog, ham, salami, pepperoni, deli meat, spam, jerky
- "ultra_processed": frozen meals, fast food, packaged snacks, instant noodles, chicken nuggets, fish sticks

COOKING METHODS:
- "charred_grilled": visibly charred, blackened, or heavily grilled food with char marks
- "fried": deep fried or pan fried foods (french fries, fried chicken, tempura, chips)

BEVERAGES:
- "high_sugar_beverage": soda, fruit juice, energy drinks, sweetened coffee/tea, milkshakes, smoothies with added sugar
- "caffeine": coffee, espresso, tea, energy drinks, caffeinated soda
- "alcohol": beer, wine, cocktails, spirits, hard seltzer

NUTRITIONAL CONCERNS:
- "high_sodium": estimated sodium > 1000mg (fast food, chips, cured meats, soy sauce heavy dishes)
- "refined_grain": white bread, white rice, regular pasta, pastries, most baked goods, pizza dough
- "spicy_irritant": very spicy foods, hot sauce, chili peppers, wasabi, horseradish
- "acidic_trigger": citrus fruits, tomato-based dishes, vinegar-heavy foods, coffee

Only include flags that clearly apply. Return valid JSON only.`;

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
    ]);

    const text = result.response.text();
    console.log('Gemini raw response:', text.substring(0, 500));
    // Clean up any markdown formatting
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('JSON parse error. Raw text:', cleanJson.substring(0, 500));
      throw new Error(`Failed to parse Gemini response as JSON: ${cleanJson.substring(0, 200)}`);
    }
  } catch (error: any) {
    console.error('Error analyzing food:', error);
    console.error('Error details:', {
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      response: error?.response?.data || error?.response,
    });
    throw error;
  }
}

export async function generateDoctorReport(
  mealSummary: string,
  insights: Record<string, any>,
  bloodWork?: Record<string, any>
): Promise<string> {
  // Use explicit selected period if provided, otherwise fall back to dateRange
  const reportingPeriod = insights.selectedPeriodLabel
    ? `${insights.selectedPeriodLabel} (${insights.selectedPeriodDays} days)`
    : insights.dateRange || 'N/A';

  const prompt = `Generate a professional 1-page dietary pattern report for a physician.

Reporting Period: ${reportingPeriod}
Total Meals Analyzed: ${insights.totalMeals || 0} meals

Sample of Recent Meals:
${mealSummary}

Key Insights:
- Plastic bottle beverages: ${insights.plasticCount || 0} (${insights.plasticPerDay?.toFixed(1) || 0}/day)
- Processed meat servings: ${insights.processedMeatCount || 0} (${insights.processedMeatPerWeek?.toFixed(1) || 0}/week)
- Ultra-processed foods: ${insights.ultraProcessedPercent || 0}% of meals
- Meals after 9pm: ${insights.lateMealPercent || 0}%
- Average dinner time: ${insights.avgDinnerTime || 'N/A'}
- Caffeine intake: ${insights.caffeinePerDay?.toFixed(1) || 0}/day (${insights.lateCaffeineCount || 0} after 2pm)
- Alcohol: ${insights.alcoholPerWeek?.toFixed(1) || 0} drinks/week
- Fried foods: ${insights.friedFoodPerWeek?.toFixed(1) || 0}/week
- High sodium meals: ${insights.highSodiumPerDay?.toFixed(1) || 0}/day
- Total meals logged: ${insights.totalMeals || 0}
- Days of data: ${insights.daysTracked || 'N/A'}

${bloodWork ? `Blood Work Results:
- Total Cholesterol: ${bloodWork.totalCholesterol} mg/dL
- LDL: ${bloodWork.ldl} mg/dL
- HDL: ${bloodWork.hdl} mg/dL
- Triglycerides: ${bloodWork.triglycerides} mg/dL
- Fasting Glucose: ${bloodWork.fastingGlucose} mg/dL` : 'No blood work provided.'}

Write a professional report with:
1. Executive Summary (3-4 sentences)
2. Key Findings (bullet points with clinical relevance)
3. ${bloodWork ? 'Blood Work Correlations' : 'Dietary Pattern Concerns'}
4. Recommendations for Discussion

Use professional medical language. Be factual, not alarmist. Format in clean markdown.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}
