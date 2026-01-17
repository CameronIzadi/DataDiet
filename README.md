# Dietary Black Box 🥗📦

> "Prevent disease. React when needed."

A revolutionary dietary tracking app that captures your meals passively without showing daily calories or metrics. Use it for **prevention** (catch risky patterns early) and **reaction** (understand symptoms when they arise).

## 🎯 What Makes This Different

Unlike MyFitnessPal or Noom, this app:
- **Doesn't show daily calories** - No guilt, no obsession
- **No streaks or gamification** - Anti-engagement model
- **Tracks what others don't** - Plastic bottles, processed meat frequency, meal timing
- **Doctor-facing output** - Professional reports for your physician
- **Dual purpose** - Prevention AND reaction to health issues

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd dietary-blackbox
npm install
```

### 2. Set Up Firebase (Required)

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or use existing)
3. Name it something like "dietary-blackbox"

#### Enable Services
1. **Authentication:**
   - Go to Build > Authentication > Get Started
   - Click "Sign-in method" tab
   - Enable **Google** provider
   - Add your domain to "Authorized domains" (localhost is auto-added)

2. **Firestore Database:**
   - Go to Build > Firestore Database > Create database
   - Start in test mode for development

3. **Storage:**
   - Go to Build > Storage > Get Started
   - Start in test mode for development

#### Get Config Values
1. Go to Project Settings (gear icon) > General
2. Scroll to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register the app and copy the config values

### 3. Set Up Environment Variables

Create a file called `.env.local` in the project root:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Google Gemini API Key (for AI food analysis)
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

#### Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API key"
3. Copy it to `NEXT_PUBLIC_GEMINI_API_KEY`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Features

### 1. Meal Capture
- Photo upload or camera capture
- Text description fallback
- Minimal "Meal Logged ✓" confirmation (no calories shown)

### 2. AI Food Analysis (Gemini)
- Identifies foods and portions
- Detects containers (plastic bottles)
- Flags concerning patterns automatically

### 3. Insights Dashboard
- **Plastic Bottle Exposure** - Microplastics/BPA concerns
- **Processed Meat** - WHO Group 1 carcinogen tracking
- **Late Meals** - Circadian rhythm impacts
- **Meal Timing Distribution** - Visual breakdown

### 4. Blood Work Integration
- Manual entry of test results
- Automatic correlation with dietary patterns
- Reference range checking

### 5. Doctor Report
- AI-generated professional narrative
- PDF/Print export
- Blood work correlations included

## 🛡️ Prevention vs Reaction

### Prevention Mode
- Weekly pattern analysis
- Early warning alerts for concerning trends
- Processed meat consumption tracking
- Late-night eating trend detection

### Reaction Mode
- Blood work correlation analysis
- Symptom-to-diet pattern matching
- Historical data for doctor appointments
- PDF reports for medical records

## 🏗 Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **AI:** Google Gemini 2.0 Flash
- **Backend:** Firebase (Firestore, Storage, Auth)
- **Icons:** Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── app/              # Main application
│   │   ├── page.tsx      # Dashboard
│   │   ├── capture/      # Meal logging
│   │   ├── insights/     # Pattern analysis
│   │   ├── bloodwork/    # Blood test input
│   │   └── report/       # Doctor report generator
├── components/
│   ├── Navigation.tsx
│   ├── InsightCard.tsx
│   ├── MealCard.tsx
│   └── MealTimingChart.tsx
├── services/
│   ├── auth.ts           # Google Sign-In
│   ├── gemini.ts         # AI food analysis
│   └── insights.ts       # Pattern calculations
├── context/
│   └── AppContext.tsx    # Global state
├── data/
│   └── demoData.ts       # Pre-loaded demo meals
├── config/
│   └── firebase.ts       # Firebase setup
└── types/
    └── index.ts          # TypeScript types
```

## 🔑 Key Differentiators

1. **"Dietary Dashcam"** - Captures continuously, useful when something happens
2. **No Daily Engagement** - Anti-gamification, no calorie guilt
3. **Doctor-Facing Output** - Narrative reports, not raw data
4. **Unusual Insights** - Plastic, carcinogens, timing (nobody else tracks)
5. **Preventive + Reactive** - Catches patterns AND explains problems

## 📱 How to Use

1. **Sign In** — Use Google Sign-In for secure access
2. **Log Meals** — Snap a photo or describe what you ate
3. **View Insights** — See patterns in plastic exposure, processed meat, late eating
4. **Add Blood Work** — Input your test results for correlation analysis  
5. **Generate Reports** — Create AI-powered doctor-ready summaries

## 🛠 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 🔧 Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Make sure you've created `.env.local` with valid Firebase config
- Check that your API key is correct from Firebase Console
- Restart the dev server after adding environment variables

### Google Sign-In Not Working
- Ensure Google provider is enabled in Firebase Authentication
- Check that localhost is in your authorized domains

## 📄 License

MIT

---

© 2025 Dietary Black Box
