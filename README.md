# DataDiet

DataDiet is a **dietary black box** and **health‑infrastructure platform** for patient–doctor dieting workflows. Users capture meals with quick photos and the system surfaces medically useful patterns when something changes (labs, symptoms, sleep, gut issues). It is **not** a daily calorie tracker.

---

## Overview

**Purpose**
- Create a reliable dietary record that helps patients and clinicians answer “what changed?” when health signals shift.

**Problems We’re Solving**
- **Diet recall is unreliable**: Patients can’t accurately remember what they ate days or months ago, yet clinicians need that history when labs or symptoms change.
- **Most diet apps optimize for daily engagement**: Calorie‑first tools create fatigue, guilt, and dropout, so they don’t produce long‑term records.
- **No clinician‑ready output**: Existing trackers don’t translate diet history into concise, medical‑grade summaries.
- **Untracked signals matter**: Plastics, carcinogenic cooking methods, meal timing, irritants, and ultra‑processed exposure aren’t tracked in typical apps.
- **High societal cost**: Diet‑related disease burden is massive; preventing and explaining changes requires longitudinal data.

**Current Apps**
- **iOS app (Expo)**: meal capture, insights, blood work input, doctor reports, PDF export.
- **Web app (planned)**: patient + doctor portal for review, messaging, and document requests.

---

## Implemented Features (iOS)

### Capture → Analyze → Store
- Camera or gallery meal capture.
- Gemini 3 Flash photo analysis:
  - foods + estimated portions
  - container type
  - dietary flags (below)
  - estimated nutrition (stored; not emphasized)
- Firestore storage: `users/{userId}/meals/{mealId}`
- Image uploads in Firebase Storage

### Personalization
- Onboarding: track everything or select specific signals (gut, blood pressure, sleep, lipids, etc.).

### Insights
- Dashboard with signal‑driven metrics and trend visuals.

### Blood Work
- Manual entry screen for common labs.
- Lab file upload (PDF/image) stored to Firebase Storage.

### Doctor Report
- Gemini narrative report.
- PDF export (expo‑print + expo‑sharing).
- Report history (AsyncStorage, 7‑day TTL).

### Auth
- Firebase Email/Password auth.

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
- `late_meal` when logged after 9pm (or before 5am).

---

## Tech Stack

- **Expo + React Native**
- **Firebase** (Auth, Firestore, Storage)
- **Gemini 3 Flash** (`@google/generative-ai`)
- **expo-image-picker**, **expo-print**, **expo-sharing**
- **AsyncStorage** for report history + blood work metadata (current)

---

## Getting Started (iOS)

```bash
cd iosapp
npm install
```

Create `iosapp/.env`:

```
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

### Firebase Setup (minimum)
- Enable **Authentication** (Email/Password)
- Enable **Firestore**
- Enable **Storage**

---

## Repo Structure

- `iosapp/` → iOS app (current codebase)
- `webapp/` → planned Next.js app (patient + doctor portal)
- `iosapp/IMPLEMENTATION_PLAN.md` → build plan
- `iosapp/RESEARCH.md` → research + evidence notes

---

## Product Principles

- **Capture & forget**: minimal daily engagement, no guilt.
- **Clinician‑friendly output**: one‑page report, actionable patterns.
- **Unusual signals**: plastics, carcinogens, timing, irritants.
- **Preventive + reactive**: help before and after lab changes.

---

## Known Gaps / Next Steps

- Blood work + report history are **local‑only** right now.
- Web app not implemented yet (folder reserved).
