# DataDiet (iOS App)

DataDiet is a **dietary black box** and a **health infrastructure platform** for patient‑doctor dieting workflows: capture meals with a quick photo, forget about them, and surface medically useful patterns when something changes (labs, symptoms, sleep, gut issues). It is **not** a daily calorie tracker.

This README reflects the current iOS app implementation and the intent described in `Downloads/HACKSTART`.

---

## What’s Implemented (iOS / Expo)

### Core Flow (MVP)
- **Photo capture** (camera or gallery) with a fast “Log Meal” flow.
- **Gemini 3 Flash analysis** of meal photos:
  - Foods + estimated portions
  - Container type (plastic_bottle, glass, can, none)
  - Dietary flags (see list below)
  - Estimated nutrition (stored; not emphasized in UI)
- **Firebase storage** for meals + images:
  - Firestore: `users/{userId}/meals/{mealId}`
  - Cloud Storage: meal image uploads
- **Personalized signal tracking (onboarding)**:
  - “Track everything” or select only the signals you care about.
- **Insights dashboard** with trends + charts based on selected signals.
- **Blood work input**:
  - Manual entry screen
  - Upload lab file (PDF/image) and store in Firebase Storage
  - Current implementation saves metadata locally (AsyncStorage).
- **Doctor report generation**:
  - Gemini narrative report
  - PDF export (expo-print + expo-sharing)
  - Report history stored locally (AsyncStorage, 7‑day TTL)

### Auth & Settings
- **Firebase Auth (Email/Password)**
- Theme settings, logout, etc.

---

## Dietary Flags (Image Analysis)

Gemini is prompted to return only applicable flags:

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

The app **also adds**:
- `late_meal` when a meal is logged after 9pm (or before 5am).

---

## Tech Stack

- **Expo + React Native**
- **Firebase** (Auth, Firestore, Storage)
- **Gemini 3 Flash** (`@google/generative-ai`)
- **expo-image-picker**, **expo-print**, **expo-sharing**
- **AsyncStorage** (report history + blood work metadata for now)

---

## Setup (iOS App)

From repo root:

```bash
cd iosapp
npm install
```

Create `.env` in `iosapp/`:

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

---

## Project Structure

- `iosapp/` → iOS app (current codebase)
- `webapp/` → planned Next.js app (patient + doctor portal)

---

## Product Philosophy (from HACKSTART)

- **No daily calorie guilt** — capture and move on.
- **Doctor‑ready output** — readable reports, not raw data.
- **Unusual insights** — plastics, carcinogens, meal timing, irritants.
- **Preventive + reactive** — patterns before and after lab changes.

---

## Status / Known Gaps

- Blood work and report history are **local-only** (AsyncStorage) in this build.
- Web app is planned (folder reserved).
