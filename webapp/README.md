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

## Prerequisites

Before running the application, ensure you have the following installed:

- Node.js 18.0 or higher
- npm 9.0 or higher
- Git

You will also need:

- A [Google Cloud](https://cloud.google.com/) account with access to the Gemini API
- A [Firebase](https://firebase.google.com/) project

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/datadiet.git
cd datadiet
```

### 2. Firebase Configuration

1. Create a new project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - **Authentication**: Enable Email/Password and Google sign-in providers
   - **Cloud Firestore**: Create a database in production mode
   - **Cloud Storage**: Enable storage for meal images
3. Navigate to Project Settings > General > Your Apps
4. Register a web app and copy the configuration values

### 3. Gemini API Configuration

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Generate an API key
3. Copy the key for use in environment variables

---

## Running the Web App

Navigate to the web app directory:

```bash
cd webapp
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file in the `webapp` directory:

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

---

## Running the iOS App

Navigate to the iOS app directory:

```bash
cd iosapp
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the `iosapp` directory:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Start the Expo development server:

```bash
npx expo start
```

Scan the QR code with the Expo Go app on your iOS device, or press `i` to open in the iOS Simulator.

---

## Project Structure

```
datadiet/
├── iosapp/                     # iOS application (Expo + React Native)
│   ├── app/                    # Screen components
│   ├── components/             # Reusable UI components
│   ├── services/               # API and Firebase services
│   └── package.json
│
├── webapp/                     # Web application (Next.js)
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── login/          # Authentication
│   │   │   └── app/            # Protected dashboard routes
│   │   ├── components/         # Reusable React components
│   │   ├── context/            # React context providers
│   │   ├── services/           # Firebase and Gemini integrations
│   │   ├── lib/                # Utility functions
│   │   └── types/              # TypeScript definitions
│   ├── public/                 # Static assets
│   └── package.json
│
└── README.md
```

---

## Available Scripts

### Web App

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### iOS App

| Command | Description |
|---------|-------------|
| `npx expo start` | Start Expo development server |
| `npx expo start --ios` | Start with iOS Simulator |
| `npx expo build:ios` | Create iOS build |

---

## License

MIT
