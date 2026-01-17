# DataDiet

A **dietary black box** for patient-doctor workflows. Capture meals effortlessly, surface medically-relevant patterns, and generate doctor-ready reports when health signals change.

**Not a calorie counter.** A long-term dietary record.

---

## The Problem

- **Diet recall is unreliable** — Patients can't accurately recall what they ate weeks ago, but clinicians need this when labs or symptoms shift
- **Existing apps cause fatigue** — Calorie-first tools create guilt and dropout; they don't build lasting records
- **No clinical output** — Trackers don't produce doctor-ready summaries
- **Important signals go untracked** — Plastics, carcinogenic cooking, meal timing, and ultra-processed exposure aren't captured

---

## Features

| Feature | iOS App | Web App |
|---------|---------|---------|
| Meal capture (camera/gallery) | ✅ | ✅ |
| AI food analysis (Gemini) | ✅ | ✅ |
| Dietary flag detection | ✅ | ✅ |
| Insights dashboard | ✅ | ✅ |
| Blood work input | ✅ | 🚧 |
| Doctor report generation | ✅ | ✅ |
| PDF/HTML export | ✅ | ✅ |
| Firebase sync | ✅ | ✅ |
| Google OAuth | — | ✅ |

### Dietary Flags Tracked

The AI detects these health-relevant patterns:

- `plastic_bottle` — Microplastic/BPA exposure
- `plastic_container_hot` — Heated plastic containers
- `processed_meat` — WHO Group 1 carcinogen
- `ultra_processed` — NOVA Group 4 foods
- `charred_grilled` — HCA/PAH formation
- `fried` — Acrylamide and oxidized fats
- `high_sugar_beverage` — Metabolic impact
- `late_meal` — Circadian disruption (after 9pm)
- `high_sodium` — Blood pressure impact
- `caffeine` / `alcohol` — Sleep and gut effects
- `spicy_irritant` / `acidic_trigger` — GI sensitivity

---

## Tech Stack

### iOS App (`/iosapp`)
- Expo + React Native
- Firebase (Auth, Firestore, Storage)
- Gemini 2.0 Flash

### Web App (`/webapp`)
- Next.js 16 + TypeScript
- Tailwind CSS v4
- Firebase (Auth, Firestore)
- Gemini 2.0 Flash
- Framer Motion

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

```bash
npx expo start
```

### Web App

```bash
cd webapp
npm install
```

Create `webapp/.env.local`:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Firebase Setup

1. Create a Firebase project
2. Enable **Authentication** (Email/Password + Google)
3. Enable **Firestore Database**
4. Enable **Storage**

---

## Project Structure

```
DataDiet/
├── iosapp/          # iOS app (Expo + React Native)
│   ├── app/         # App screens
│   ├── components/  # Reusable components
│   └── services/    # Firebase, Gemini services
├── webapp/          # Web app (Next.js)
│   ├── src/
│   │   ├── app/     # Next.js app router pages
│   │   ├── components/
│   │   ├── services/
│   │   └── context/
│   └── public/
└── README.md
```

---

## Design Philosophy

- **Capture & forget** — Minimal daily friction, no guilt
- **Clinician-ready** — One-page reports with actionable patterns
- **Track what matters** — Plastics, carcinogens, timing, irritants
- **Preventive + reactive** — Useful before and after health changes

---

## License

MIT
