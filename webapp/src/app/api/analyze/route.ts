import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Server-side only - API key not exposed to browser
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not configured');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: 'gemini-3-flash-preview' });

// Simple in-memory rate limiting (per IP, resets on server restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Check API key configuration
    if (!model) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, data } = body;

    if (!action || !data) {
      return NextResponse.json(
        { error: 'Missing action or data' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'analyzeImage': {
        const { base64Image, prompt } = data;
        if (!base64Image || !prompt) {
          return NextResponse.json(
            { error: 'Missing image or prompt' },
            { status: 400 }
          );
        }

        const result = await model.generateContent([
          prompt,
          { inlineData: { data: base64Image, mimeType: 'image/jpeg' } }
        ]);

        return NextResponse.json({ result: result.response.text() });
      }

      case 'analyzeText': {
        const { prompt } = data;
        if (!prompt) {
          return NextResponse.json(
            { error: 'Missing prompt' },
            { status: 400 }
          );
        }

        const result = await model.generateContent(prompt);
        return NextResponse.json({ result: result.response.text() });
      }

      case 'generateReport': {
        const { prompt } = data;
        if (!prompt) {
          return NextResponse.json(
            { error: 'Missing prompt' },
            { status: 400 }
          );
        }

        const result = await model.generateContent(prompt);
        return NextResponse.json({ result: result.response.text() });
      }

      case 'queryFoodHistory': {
        const { prompt } = data;
        if (!prompt) {
          return NextResponse.json(
            { error: 'Missing prompt' },
            { status: 400 }
          );
        }

        const result = await model.generateContent(prompt);
        return NextResponse.json({ result: result.response.text() });
      }

      case 'extractBloodWork': {
        const { base64Image, mimeType } = data;
        if (!base64Image) {
          return NextResponse.json(
            { error: 'Missing image data' },
            { status: 400 }
          );
        }

        const extractionPrompt = `You are a medical document analyzer. Extract ALL blood work values from this lab report image.

Return a JSON object with:
1. "testDate": The date of the test if visible (format: "YYYY-MM-DD"), or null
2. "metrics": An object where each key is the test name and value is an object with:
   - "value": The numeric value
   - "unit": The unit of measurement (e.g., "mg/dL", "mmol/L", "%", "cells/mcL")
   - "referenceRange": The reference range if shown (e.g., "< 200", "70-100", "4.5-11.0")
   - "status": One of "low", "normal", "borderline", or "high" based on whether the value is flagged or outside reference range

Common blood work tests to look for (but extract ALL tests you find):
- Lipid Panel: Total Cholesterol, LDL, HDL, Triglycerides, VLDL, Non-HDL Cholesterol
- Blood Sugar: Fasting Glucose, HbA1c, Random Glucose
- Complete Blood Count (CBC): WBC, RBC, Hemoglobin, Hematocrit, Platelets, MCV, MCH, MCHC, RDW
- Metabolic Panel: Sodium, Potassium, Chloride, CO2, BUN, Creatinine, Glucose, Calcium
- Liver Function: ALT, AST, ALP, Bilirubin, Albumin, Total Protein
- Thyroid: TSH, T3, T4, Free T4
- Iron Studies: Iron, Ferritin, TIBC, Transferrin Saturation
- Vitamins: Vitamin D, Vitamin B12, Folate
- Inflammation: CRP, ESR
- Other: Uric Acid, Magnesium, Phosphorus, GFR, PSA, etc.

IMPORTANT:
- Extract EVERY test value you can see, not just the common ones
- Use the exact test name as shown on the report
- If a value is flagged as High (H) or Low (L), set the appropriate status
- Return ONLY valid JSON, no markdown or explanation

Example response format:
{
  "testDate": "2024-01-15",
  "metrics": {
    "Total Cholesterol": { "value": 195, "unit": "mg/dL", "referenceRange": "< 200", "status": "normal" },
    "LDL Cholesterol": { "value": 120, "unit": "mg/dL", "referenceRange": "< 100", "status": "high" },
    "Hemoglobin": { "value": 14.2, "unit": "g/dL", "referenceRange": "12.0-16.0", "status": "normal" }
  }
}`;

        const result = await model.generateContent([
          extractionPrompt,
          { inlineData: { data: base64Image, mimeType: mimeType || 'image/jpeg' } }
        ]);

        const responseText = result.response.text();

        // Try to parse the JSON response
        try {
          // Remove markdown code blocks if present
          const cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          return NextResponse.json({ result: parsed });
        } catch {
          // If parsing fails, return the raw text for debugging
          return NextResponse.json({
            error: 'Failed to parse blood work data',
            rawResponse: responseText
          }, { status: 422 });
        }
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API analyze error:', error);

    // Extract meaningful error message
    let errorMessage = 'Failed to process request';
    if (error instanceof Error) {
      // Check for common Gemini API errors
      if (error.message.includes('SAFETY')) {
        errorMessage = 'Content was blocked by safety filters';
      } else if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = 'API quota exceeded. Please try again later.';
      } else if (error.message.includes('invalid') || error.message.includes('API_KEY')) {
        errorMessage = 'Invalid API key configuration';
      } else if (error.message.includes('timeout') || error.message.includes('DEADLINE_EXCEEDED')) {
        errorMessage = 'Request timed out. Please try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
