import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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
  "flags": ["plastic_bottle", "processed_meat", "late_meal", "high_sodium", "ultra_processed"],
  "estimated_nutrition": {"calories": number, "protein": number, "carbs": number, "fat": number, "sodium": number}
}

Flag rules:
- plastic_bottle: any beverage in plastic container
- processed_meat: bacon, sausage, hot dog, ham, salami, pepperoni, deli meat
- high_sodium: estimated sodium > 1000mg
- ultra_processed: frozen meals, fast food, packaged snacks

Only include applicable flags. Return valid JSON only.`;

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
    ]);

    const text = result.response.text();
    // Clean up any markdown formatting
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error analyzing food:', error);
    throw error;
  }
}

export async function generateDoctorReport(
  mealSummary: string,
  insights: Record<string, any>,
  bloodWork?: Record<string, any>
): Promise<string> {
  const prompt = `Generate a professional 1-page dietary pattern report for a physician.

Patient Dietary Data:
${mealSummary}

Key Insights:
- Plastic bottle beverages: ${insights.plasticCount || 0} (${insights.plasticPerDay?.toFixed(1) || 0}/day)
- Processed meat servings: ${insights.processedMeatCount || 0} (${insights.processedMeatPerWeek?.toFixed(1) || 0}/week)
- Meals after 9pm: ${insights.lateMealPercent || 0}%
- Average dinner time: ${insights.avgDinnerTime || 'N/A'}
- Total meals logged: ${insights.totalMeals || 0}
- Reporting period: ${insights.dateRange || 'N/A'}

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
