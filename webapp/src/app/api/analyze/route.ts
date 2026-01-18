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
