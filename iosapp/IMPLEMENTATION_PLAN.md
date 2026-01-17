# DataDiet Visual & Feature Improvement Plan

Based on Nurvo comparison and engineer feedback.

---

## Phase 1: Core Reusable Components

### 1.1 Card Component (`src/components/Card.tsx`)
**Pattern from:** `/CLI_AGENTS/Nurvo/mobile-app/src/components/Card.tsx`

```
Variants: hero | primary | secondary | utility
Features:
- LinearGradient backgrounds (theme-aware)
- Platform-specific shadows (iOS shadowX, Android elevation)
- Light mode: subtle border for definition
- Dark mode: no border, gradients do the work
- noPadding option for custom layouts

Config per variant:
- hero: padding 24, radius 20, elevation 12
- primary: padding 20, radius 18, elevation 8
- secondary: padding 16, radius 14, elevation 4
- utility: padding 12, radius 12, elevation 2
```

### 1.2 Skeleton Components (`src/components/Skeleton.tsx`)
**Pattern from:** `/CLI_AGENTS/Nurvo/mobile-app/src/components/Skeleton.tsx`

```
Components to create:
- Skeleton (base with shimmer animation)
- SkeletonText (multi-line text placeholder)
- SkeletonCard (card with header + content)
- SkeletonHeroCard (big stat card)
- SkeletonListItem (meal card placeholder)
- SkeletonInsightCard (insight card placeholder)

Animation: 1200ms shimmer with bezier easing
Colors: Theme-aware base + shimmer overlay
```

### 1.3 Typography Component (`src/components/Text.tsx`)
```
Variants matching design system:
- displayLarge, displayMedium
- dataLarge, dataMedium, dataSmall
- headlineLarge, headlineMedium, headlineSmall
- bodyLarge, bodyMedium, bodySmall
- labelLarge, labelMedium, labelSmall

Props:
- variant: string
- color?: 'primary' | 'muted' | 'soft' | 'faint' | custom
- style?: additional overrides
```

### 1.4 Mini Chart Components (`src/components/charts/`)
```
MiniBarChart.tsx
- 7 bars for weekly data
- Animated fill on mount
- Color-coded by concern level

MiniTrendLine.tsx
- Simple SVG path
- Shows up/down/flat trend
- Optional gradient fill under line

ProgressRing.tsx
- Circular progress indicator
- Percentage in center
- Used for daily limits
```

---

## Phase 2: Screen Updates

### 2.1 LogMealScreen.tsx
**Current:** Flat Views, loading text
**Changes:**
- [x] Already using LinearGradient cards (done in previous update)
- [ ] Wrap meal cards in `<Card variant="secondary">`
- [ ] Wrap CTA in `<Card variant="hero">`
- [ ] Replace loading state with `<SkeletonListItem />` x 3
- [ ] Ensure image thumbnails are prominent (already showing)

### 2.2 InsightsScreen.tsx
**Current:** Text blocks, static numbers, basic summary
**Changes:**
- [ ] Add Hero card at top: "Your Last 30 Days"
  - Big number: total meals logged
  - Sub-stats: avg calories, tracking X signals
  - Gradient background (hero variant)

- [ ] Replace SummaryCard with proper Hero component

- [ ] Add mini-charts to insight cards:
  - Late meals: 7-day bar chart
  - Processed meat: weekly trend
  - Caffeine: daily count bars

- [ ] Add severity chips (low/moderate/elevated) with colors:
  - low: success green
  - moderate: warning amber
  - elevated: error red

- [ ] Replace loading with `<SkeletonHeroCard />` + `<SkeletonCard />` x 4

- [ ] Show "Tracking X signals" badge from onboarding data

### 2.3 ReportScreen.tsx
**Current:** Basic button list
**Changes:**
- [ ] Add Hero card: "Generate Doctor Report"
  - Icon + "Ready in ~15 seconds"
  - Big CTA button

- [ ] Add "Analyze 30 days before last blood test" quick action
  - Only shows if blood work exists

- [ ] Use Card components for report options

- [ ] Replace loading with skeletons

### 2.4 ReportHistoryScreen.tsx
**Current:** Loading text, flat list
**Changes:**
- [ ] Replace loading with `<SkeletonListItem />` x 5
- [ ] Wrap list items in `<Card variant="utility">`
- [ ] Add empty state with illustration

---

## Phase 3: New Screens

### 3.1 BloodWorkScreen.tsx (`src/screens/BloodWorkScreen.tsx`)
**Purpose:** Input blood test results for correlation analysis

```
Sections:
1. Header: "Add Blood Work"
2. Date picker for test date
3. Input fields (numeric with units):
   - Total Cholesterol (mg/dL)
   - LDL (mg/dL)
   - HDL (mg/dL)
   - Triglycerides (mg/dL)
   - Fasting Glucose (mg/dL)
4. Notes text area
5. Save button

Navigation:
- Add to MainStackParamList
- Link from ReportScreen or Settings
```

### 3.2 Enhanced Meal Detail Modal
**Current:** Basic modal in LogMealScreen
**Changes:**
- [ ] Full-width image at top
- [ ] Meal name + timestamp
- [ ] Macro breakdown with colored bars
- [ ] Flagged signals with icons + explanations
- [ ] "Doctor-ready summary" text snippet
- [ ] Share/Export button

---

## Phase 4: Navigation Updates

### 4.1 Add BloodWork to navigation
```typescript
// MainStackParamList
BloodWork: undefined;

// Add screen to MainNavigator
<Stack.Screen name="BloodWork" component={BloodWorkScreen} />
```

### 4.2 Link from ReportScreen
- Add "Add Blood Work" card/button
- Show "Last test: [date]" if exists

---

## Phase 5: Design System Updates

### 5.1 Update designSystem.ts
```
Add:
- CARD_STYLES object with variant configs
- SEVERITY_COLORS for concern levels
- CHART_COLORS for visualizations
```

### 5.2 ThemeContext additions
```
Add to theme tokens:
- heroGradient
- cardGradient
- elevatedGradient
- severityColors (low, moderate, elevated)
```

---

## Implementation Order

1. **Card.tsx** - Foundation for all other updates
2. **Skeleton.tsx** - Immediate visual lift
3. **Text.tsx** - Typography consistency
4. **Update InsightsScreen** - Biggest visual impact
5. **Mini charts** - Premium feel
6. **Update LogMealScreen** - Use new Card
7. **Update ReportScreen** - Hero CTA
8. **BloodWorkScreen** - New feature
9. **Update ReportHistoryScreen** - Skeletons + Cards

---

## Files to Create
```
src/components/Card.tsx
src/components/Skeleton.tsx
src/components/Text.tsx
src/components/charts/MiniBarChart.tsx
src/components/charts/MiniTrendLine.tsx
src/components/charts/ProgressRing.tsx
src/components/charts/index.ts
src/screens/BloodWorkScreen.tsx
```

## Files to Modify
```
src/config/designSystem.ts (add card styles, severity colors)
src/screens/InsightsScreen.tsx (hero, charts, skeletons)
src/screens/LogMealScreen.tsx (Card wrapper, skeletons)
src/screens/ReportScreen.tsx (hero CTA, blood work link)
src/screens/ReportHistoryScreen.tsx (skeletons, Cards)
src/navigation/MainNavigator.tsx (add BloodWork screen)
```

---

## Quick Wins (Do First)
1. Card.tsx - 30 min
2. Skeleton.tsx - 30 min
3. Swap InsightsScreen loading → skeletons - 15 min
4. Add Hero card to InsightsScreen - 20 min
5. Add severity color chips to insight cards - 15 min

Total quick wins: ~2 hours for major visual lift
