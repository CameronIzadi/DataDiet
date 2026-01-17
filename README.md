# DataDiet

DataDiet is a **dietary black box** and **health‑infrastructure platform** for patient–doctor dieting workflows. Users capture meals with quick photos and the system surfaces medically useful patterns when something changes (labs, symptoms, sleep, gut issues). It is **not** a daily calorie tracker.

> "Prevent disease. React when needed."

---

## Overview

**Purpose**
- Create a reliable dietary record that helps patients and clinicians answer "what changed?" when health signals shift.

**Current Apps**
- **iOS app (Expo)**: meal capture, insights, blood work input, doctor reports, PDF export.
- **Web app (Next.js)**: patient dashboard with real-time sync, doctor reports, pattern analysis.

---

## 🎯 What Makes This Different

Unlike MyFitnessPal or Noom, this app:
- **Doesn't show daily calories** - No guilt, no obsession
- **No streaks or gamification** - Anti-engagement model
- **Tracks what others don't** - Plastic bottles, processed meat frequency, meal timing
- **Doctor-facing output** - Professional reports for your physician
- **Dual purpose** - Prevention AND reaction to health issues

---

## Implemented Features

### iOS App (Expo)

#### Capture → Analyze → Store
- Camera or gallery meal capture
- Gemini 3 Flash photo analysis (foods, portions, containers, flags)
- Firestore storage: `users/{userId}/meals/{mealId}`
- Image uploads in Firebase Storage

#### Personalization
- Onboarding: track everything or select specific signals (gut, blood pressure, sleep, lipids, etc.)

#### Insights
- Dashboard with signal‑driven metrics and trend visuals

#### Blood Work
- Manual entry screen for common labs
- Lab file upload (PDF/image) stored to Firebase Storage

#### Doctor Report
- Gemini narrative report
- PDF export (expo‑print + expo‑sharing)
- Report history (AsyncStorage, 7‑day TTL)

### Web App (Next.js)

#### Dashboard
- Real-time sync with iOS app data via Firestore
- Light theme with teal accents matching iOS design
- Weekly activity heatmap and meal timing distribution
- Stats cards with color-coded status indicators

#### Authentication
- Google Sign-In
- Email/Password authentication
- Protected routes

#### Insights
- Plastic exposure tracking
- Processed meat monitoring
- Late meal detection
- All 13 dietary flags visualized

#### Doctor Report
- AI-generated professional narrative
- PDF export functionality

---

## Dietary Flags (Image Analysis)

Gemini returns only applicable flags:

```json
{
  "flags": [
    "plastic_bottle",
    "plastic_container_hot",
    "processed_meat",
    "ultra_processed",
    "charred_grilled",
    "fried",
    "high_sugar_beverage",
    "caffeine",
    "alcohol",
    "high_sodium",
    "refined_grain",
    "spicy_irritant",
    "acidic_trigger"
  ]
}
```

The app also adds:
- `late_meal` when logged after 9pm (or before 5am)

---

## Tech Stack

### iOS App
- **Expo + React Native**
- **Firebase** (Auth, Firestore, Storage)
- **Gemini 3 Flash** (`@google/generative-ai`)
- **expo-image-picker**, **expo-print**, **expo-sharing**

### Web App
- **Next.js 15**, React, TypeScript
- **Tailwind CSS** with custom theme
- **Framer Motion** for animations
- **Firebase** (Auth, Firestore, Storage)
- **Gemini 3 Flash** for AI analysis

---

## Getting Started

### iOS App

```bash
cd iosapp
npm install
```

Create `iosapp/.env`:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Run:

```bash
npx expo start
```

### Web App

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

Run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Firebase Setup (Required)
- Enable **Authentication** (Google + Email/Password)
- Enable **Firestore** with proper security rules
- Enable **Storage**

---

## Repo Structure

```
├── iosapp/                 # iOS app (Expo + React Native)
│   ├── IMPLEMENTATION_PLAN.md
│   └── RESEARCH.md
├── src/                    # Web app (Next.js)
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Authentication
│   │   └── app/            # Dashboard & features
│   ├── components/
│   ├── services/
│   ├── context/
│   └── types/
└── README.md
```

---

## Product Principles

- **Capture & forget**: minimal daily engagement, no guilt
- **Clinician‑friendly output**: one‑page report, actionable patterns
- **Unusual signals**: plastics, carcinogens, timing, irritants
- **Preventive + reactive**: help before and after lab changes

---

## License

MIT

---

© 2025 DataDiet
