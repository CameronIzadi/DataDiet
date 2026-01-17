# DataDiet

**The dietary black box: capture what you eat, forget about it, and have answers when your doctor—or your body—asks questions.**

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

**Get your keys:**
- **Gemini API:** https://aistudio.google.com/
- **Firebase:** https://console.firebase.google.com/

### 3. Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Enable these services:
   - Authentication
   - Firestore Database
   - Cloud Storage
3. Set Firestore rules (for development):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Run the App
```bash
npm start
```

Scan the QR code with Expo Go on your phone.

## Features

- **Photo Capture:** Take photos of meals, AI analyzes them
- **Unusual Insights:** Track plastic bottles, processed meat, late meals
- **Doctor Reports:** AI-generated narrative reports for physicians
- **No Daily Feedback:** Capture and forget—data is there when you need it

## Tech Stack

- React Native + Expo
- Firebase (Firestore, Storage, Auth)
- Gemini 3 Flash (food recognition, report generation)

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx
│   ├── CaptureScreen.tsx
│   ├── InsightsScreen.tsx
│   └── ReportScreen.tsx
├── services/
│   ├── gemini.ts
│   ├── meals.ts
│   └── insights.ts
├── config/
│   └── firebase.ts
└── types/
    └── index.ts
```
