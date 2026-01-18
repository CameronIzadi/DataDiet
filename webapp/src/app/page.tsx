'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  ArrowRight, 
  Camera, 
  BarChart3, 
  FileText, 
  Droplets,
  Beef,
  Moon,
  Check,
  ChevronRight,
  TrendingUp,
  Heart,
  Activity,
  ShieldCheck,
  Stethoscope,
  Clock,
  X,
  Smartphone,
  BellOff,
  Eye,
  EyeOff,
  ChevronDown,
  Zap,
  Shield,
  Play,
  ArrowUpRight,
  User as UserIcon,
  Settings,
  Sun
} from 'lucide-react';
import { onAuthChange } from '@/services/auth';
import { User } from 'firebase/auth';
import { useTheme } from '@/context/ThemeContext';

// ============================================
// ANIMATION COMPONENTS
// ============================================

// Animated counter with spring physics
function AnimatedNumber({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);
  
  return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
}

// Gradient text with animation
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span 
      className={`bg-gradient-to-r from-sage-600 via-emerald-500 to-sage-600 bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      animate={{ backgroundPosition: ['0%', '200%'] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}

// Subtle float - very gentle movement
function SubtleFloat({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-3, 3, -3] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// Magnetic hover effect
function MagneticWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * 0.1);
      y.set((e.clientY - centerY) * 0.1);
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
}

// Reveal on scroll - subtle and clean
function RevealOnScroll({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// BENTO CARD COMPONENTS
// ============================================

function BentoCard({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-warm-100 dark:border-neutral-800 ${className}`}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' } : {}}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// iOS-style Tab Bar Icon components
function AppleIcon({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#14b8a6' : '#9ca3af'} strokeWidth="1.5">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M12 6v2m0 8v2M6 12h2m8 0h2" />
      <path d="M9 9l1.5 1.5M13.5 13.5L15 15M9 15l1.5-1.5M13.5 10.5L15 9" />
    </svg>
  );
}

function ChartIcon({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#14b8a6' : '#9ca3af'} strokeWidth="1.5">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 4 4-8" />
    </svg>
  );
}

function DocIcon({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#14b8a6' : '#9ca3af'} strokeWidth="1.5">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M8 6h8M8 10h8M8 14h4" />
    </svg>
  );
}

function HistoryIcon({ active }: { active?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#14b8a6' : '#9ca3af'} strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

// Smooth line chart SVG for insights
function MiniLineChart({ animate }: { animate?: boolean }) {
  return (
    <svg width="100%" height="40" viewBox="0 0 200 40" className="overflow-visible">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0,35 Q20,30 40,28 T80,25 T120,15 T160,20 T200,25"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.path
        d="M0,35 Q20,30 40,28 T80,25 T120,15 T160,20 T200,25 L200,40 L0,40 Z"
        fill="url(#chartGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </svg>
  );
}

// Interactive phone mockup - Redesigned to match iOS app
function InteractivePhone({ activeScreen, setActiveScreen }: { activeScreen: number; setActiveScreen: (n: number) => void }) {
  const [insightsPeriod, setInsightsPeriod] = useState(0); // 0 = Week, 1 = 1M

  // Auto-cycle through Week and 1M when on Insights screen
  useEffect(() => {
    if (activeScreen === 1) {
      const cycleTimer = setInterval(() => {
        setInsightsPeriod(prev => prev === 0 ? 1 : 0);
      }, 2500);
      return () => clearInterval(cycleTimer);
    } else {
      setInsightsPeriod(0);
    }
  }, [activeScreen]);

  // Data for different periods
  const periodData = {
    week: { meals: 7, days: 7, signals: 14, mealsPerDay: '1.0', dateRange: '1/10 - 1/16', chartLabel: 'Last 7 days' },
    month: { meals: 28, days: 30, signals: 42, mealsPerDay: '0.9', dateRange: '12/17 - 1/16', chartLabel: 'Last 30 days' },
  };
  const currentData = insightsPeriod === 0 ? periodData.week : periodData.month;

  // Simplified Tab Bar Component - uses explicit colors to avoid dark mode inheritance
  const TabBar = ({ activeTab }: { activeTab: number }) => (
    <div className="absolute bottom-0 left-0 right-0 p-3 pb-5">
      <div className="rounded-2xl py-2 px-1 flex justify-around shadow-lg" style={{ backgroundColor: '#ffffff' }}>
        {[
          { label: 'Log', active: activeTab === 0 },
          { label: 'Insights', active: activeTab === 1 },
          { label: 'Report', active: activeTab === 2 },
          { label: 'History', active: activeTab === 3 },
        ].map((tab, i) => (
          <div key={i} className="flex flex-col items-center px-2">
            <div
              className="w-5 h-5 rounded-md mb-0.5 flex items-center justify-center"
              style={{ backgroundColor: tab.active ? '#ccfbf1' : 'transparent' }}
            >
              {i === 0 && <Camera className="w-3.5 h-3.5" style={{ color: tab.active ? '#0d9488' : '#9ca3af' }} strokeWidth={1.5} />}
              {i === 1 && <BarChart3 className="w-3.5 h-3.5" style={{ color: tab.active ? '#0d9488' : '#9ca3af' }} strokeWidth={1.5} />}
              {i === 2 && <FileText className="w-3.5 h-3.5" style={{ color: tab.active ? '#0d9488' : '#9ca3af' }} strokeWidth={1.5} />}
              {i === 3 && <Clock className="w-3.5 h-3.5" style={{ color: tab.active ? '#0d9488' : '#9ca3af' }} strokeWidth={1.5} />}
            </div>
            <span
              className="text-[8px]"
              style={{ color: tab.active ? '#0d9488' : '#9ca3af', fontWeight: tab.active ? 600 : 400 }}
            >
              {tab.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const screens = [
    {
      title: 'Log Meal',
      content: (
        <div className="px-3 pt-10 pb-20 h-full overflow-hidden" style={{ backgroundColor: '#EBEBEB' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
                <UserIcon className="w-4 h-4" style={{ color: '#9ca3af' }} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[8px] leading-tight" style={{ color: '#9ca3af' }}>Hello,</p>
                <p className="text-xs font-bold leading-tight" style={{ color: '#171717' }}>Sarah</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
              <Settings className="w-4 h-4" style={{ color: '#9ca3af' }} strokeWidth={1.5} />
            </div>
          </div>

          {/* Log a Meal Card */}
          <motion.div
            className="rounded-2xl p-3 mb-3"
            style={{ backgroundColor: '#ffffff' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f5f5' }}>
                <Camera className="w-5 h-5" style={{ color: '#737373' }} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: '#171717' }}>Log a Meal</p>
                <p className="text-[9px] truncate" style={{ color: '#9ca3af' }}>Take a photo or choose from gallery</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#d4d4d4' }} />
            </div>
          </motion.div>

          {/* Recent Meals */}
          <p className="text-xs font-bold mb-2" style={{ color: '#171717' }}>Recent Meals</p>
          <motion.div
            className="rounded-2xl p-3"
            style={{ backgroundColor: '#ffffff' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f3e8ff' }}>
                <span className="text-lg">🍫</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  <p className="text-xs font-bold truncate" style={{ color: '#171717' }}>Purdys Chocolate</p>
                  <p className="text-[8px] flex-shrink-0" style={{ color: '#9ca3af' }}>11:41 PM</p>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full" style={{ backgroundColor: '#fff1f2', color: '#f43f5e' }}>
                    Ultra Processed
                  </span>
                  <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full" style={{ backgroundColor: '#fffbeb', color: '#d97706' }}>
                    Late Meal
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#d4d4d4' }} />
            </div>
          </motion.div>

          <TabBar activeTab={0} />
        </div>
      )
    },
    {
      title: 'Insights',
      content: (
        <div className="px-3 pt-10 pb-20 h-full overflow-hidden" style={{ backgroundColor: '#EBEBEB' }}>
          {/* Time Period Tabs - All 5 periods */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex rounded-xl p-0.5" style={{ backgroundColor: '#ffffff' }}>
              {['Week', '1M', '3M', '6M', '1Y'].map((period, i) => (
                <motion.div
                  key={i}
                  className="px-2 py-1 rounded-lg text-[8px] font-semibold"
                  style={{
                    backgroundColor: i === insightsPeriod ? '#171717' : 'transparent',
                    color: i === insightsPeriod ? '#ffffff' : '#9ca3af'
                  }}
                  animate={i === insightsPeriod ? { scale: [1, 1.02, 1] } : {}}
                >
                  {period}
                </motion.div>
              ))}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
              <Settings className="w-4 h-4" style={{ color: '#9ca3af' }} strokeWidth={1.5} />
            </div>
          </div>

          {/* Summary Card */}
          <motion.div
            className="rounded-2xl p-3 mb-3"
            style={{ backgroundColor: '#ffffff' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-center mb-2">
              <motion.span
                key={currentData.dateRange}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-2 py-0.5 text-[8px] font-medium rounded-full"
                style={{ backgroundColor: '#f0fdfa', color: '#0d9488' }}
              >
                {currentData.dateRange}
              </motion.span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentData.meals}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold" style={{ color: '#171717' }}>{currentData.meals}</p>
                <p className="text-[9px] mb-2" style={{ color: '#9ca3af' }}>meals logged</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center gap-4 mb-2">
              {[
                { value: currentData.days, label: 'days' },
                { value: currentData.signals, label: 'signals' },
                { value: currentData.mealsPerDay, label: 'meals/day' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-sm font-bold" style={{ color: '#171717' }}>{stat.value}</p>
                  <p className="text-[7px]" style={{ color: '#9ca3af' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Mini Chart */}
            <div className="h-8">
              <MiniLineChart animate={true} />
            </div>
            <p className="text-[7px]" style={{ color: '#9ca3af' }}>{currentData.chartLabel}</p>
          </motion.div>

          {/* Insight Cards - 2x2 grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '🧴', label: 'Plastic', value: insightsPeriod === 0 ? '2' : '8', good: true },
              { icon: '🔥', label: 'Hot Plastic', value: '0', good: true },
              { icon: '🥩', label: 'Processed', value: insightsPeriod === 0 ? '0' : '1.2', good: true },
              { icon: '♨️', label: 'Charred', value: '0', good: true },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="rounded-xl p-2"
                style={{ backgroundColor: '#ffffff' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{card.icon}</span>
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: card.good ? '#10b981' : '#f43f5e' }}
                  />
                </div>
                <p className="text-[8px]" style={{ color: '#737373' }}>{card.label}</p>
                <p className="text-base font-bold" style={{ color: '#171717' }}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          <TabBar activeTab={1} />
        </div>
      )
    },
    {
      title: 'Report',
      content: (
        <div className="px-3 pt-10 pb-20 h-full overflow-hidden" style={{ backgroundColor: '#EBEBEB' }}>
          <div className="mb-3">
            <p className="text-sm font-bold" style={{ color: '#171717' }}>Doctor Report</p>
            <p className="text-[9px]" style={{ color: '#9ca3af' }}>Generate a report for your provider</p>
          </div>

          {/* Generate Report Card */}
          <motion.div
            className="rounded-2xl p-3 mb-2"
            style={{ backgroundColor: '#ffffff' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f5f5' }}>
                <FileText className="w-5 h-5" style={{ color: '#737373' }} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: '#171717' }}>Generate Report</p>
                <p className="text-[9px]" style={{ color: '#9ca3af' }}>Analyze last 30 days</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#d4d4d4' }} />
            </div>
            <div className="flex gap-1.5">
              <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full" style={{ backgroundColor: '#f5f5f5', color: '#525252' }}>
                ⚡ AI Powered
              </span>
              <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full" style={{ backgroundColor: '#f5f5f5', color: '#525252' }}>
                🩺 Doctor Ready
              </span>
            </div>
          </motion.div>

          {/* Blood Work Card */}
          <motion.div
            className="rounded-2xl p-3 mb-3"
            style={{ backgroundColor: '#ffffff' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f5f5' }}>
                <span className="text-base">🔬</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold" style={{ color: '#171717' }}>Blood Work</p>
                <p className="text-[9px]" style={{ color: '#9ca3af' }}>Add test results</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#d4d4d4' }} />
            </div>
          </motion.div>

          {/* Time Period Grid */}
          <p className="text-xs font-bold mb-2" style={{ color: '#171717' }}>Time Period</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '1 Month', selected: true },
              { label: '3 Months', selected: false },
              { label: '6 Months', selected: false },
              { label: '1 Year', selected: false },
            ].map((period, i) => (
              <motion.div
                key={i}
                className="p-2 rounded-xl"
                style={{
                  border: period.selected ? '1px solid #2dd4bf' : '1px solid #e5e5e5',
                  backgroundColor: period.selected ? '#f0fdfa' : '#ffffff'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold" style={{ color: '#171717' }}>{period.label}</p>
                  {period.selected && <Check className="w-3 h-3" style={{ color: '#14b8a6' }} />}
                </div>
              </motion.div>
            ))}
          </div>

          <TabBar activeTab={2} />
        </div>
      )
    }
  ];

  return (
    <div className="relative group/phone">
      {/* Phone frame - iPhone style - uses explicit colors to avoid dark mode inheritance */}
      <div
        className="relative w-[240px] h-[500px] rounded-[40px] p-2.5 shadow-2xl"
        style={{ backgroundColor: '#171717', boxShadow: '0 25px 50px -12px rgba(23, 23, 23, 0.4)' }}
      >
        {/* Dynamic Island */}
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-6 rounded-full z-20 flex items-center justify-center gap-2"
          style={{ backgroundColor: '#000000' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#404040' }} />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#404040' }} />
        </div>

        {/* Screen */}
        <div className="w-full h-full rounded-[32px] overflow-hidden relative" style={{ backgroundColor: '#EBEBEB' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeScreen}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {screens[activeScreen].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home indicator */}
        <div
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full"
          style={{ backgroundColor: '#525252' }}
        />
      </div>

      {/* Screen selector pills */}
      <div className="flex justify-center gap-2 mt-5">
        {screens.map((screen, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveScreen(i)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
              activeScreen === i
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {screen.title}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  const { theme, toggleTheme } = useTheme();
  
  // Note: navBg uses light mode colors, dark mode handled via CSS
  const navBg = useTransform(scrollYProgress, [0, 0.02], ['transparent', 'var(--nav-bg-scrolled)']);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => setUser(user));
    return () => unsubscribe();
  }, []);

  // Auto-rotate screens
  useEffect(() => {
    const interval = setInterval(() => setActiveScreen((prev) => (prev + 1) % 3), 5000);
    return () => clearInterval(interval);
  }, []);

  // Hide nav on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.8; // Hide after 80% of viewport height
      
      if (currentScrollY < heroHeight) {
        // Always show nav in hero section
        setNavVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > heroHeight) {
        // Scrolling down & past hero - hide nav
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show nav
        setNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-neutral-950 overflow-x-hidden transition-colors duration-300">
      {/* Navigation with fade mask */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50"
        initial={{ y: 0 }}
        animate={{ y: navVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.nav 
          className="relative backdrop-blur-xl border-b border-transparent"
          style={{ backgroundColor: navBg }}
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <img
                  src="/icon-192.png"
                  alt="DataDiet"
                  className="w-12 h-12 rounded-xl"
                />
                <span className="font-semibold text-warm-900 dark:text-neutral-100 text-lg hidden sm:block">DataDiet</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl bg-warm-100 dark:bg-neutral-800 flex items-center justify-center text-warm-600 dark:text-neutral-300 hover:bg-warm-200 dark:hover:bg-neutral-700 transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
                
                {user ? (
                  <Link 
                    href="/app" 
                    className="px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium text-sm hover:bg-sage-700 transition-colors shadow-lg shadow-sage-600/25"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link 
                    href="/login" 
                    className="px-5 py-2.5 bg-sage-600 text-white rounded-xl font-medium text-sm hover:bg-sage-700 transition-colors shadow-lg shadow-sage-600/25"
                  >
                    Get Started
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </motion.nav>
        {/* Gradient fade mask below nav - creates smooth content blend */}
        <div
          className="h-20 pointer-events-none -mt-px bg-gradient-to-b from-[#fafaf9] via-[#fafaf9]/50 to-transparent dark:from-neutral-950 dark:via-neutral-950/50"
        />
      </motion.div>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 px-6 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sage-200/40 to-emerald-200/30 blur-3xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-200/30 to-sage-200/30 blur-3xl"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <motion.h1
                className="text-display text-5xl sm:text-6xl lg:text-7xl text-warm-900 dark:text-neutral-100 mb-6 leading-[1.05]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Prevent disease.
                <br />
                <GradientText>React when needed.</GradientText>
              </motion.h1>

              <motion.p
                className="text-xl text-warm-600 dark:text-neutral-400 mb-10 max-w-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Your silent health companion. Capture meals in seconds, build a dietary record passively, and get
                <span className="text-warm-900 dark:text-neutral-200 font-semibold"> doctor-ready insights</span> when you actually need them.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <MagneticWrapper>
                  <Link
                    href={user ? "/app" : "/login"}
                    className="group px-8 py-4 bg-sage-600 text-white rounded-2xl font-medium text-lg shadow-xl shadow-sage-600/25 hover:bg-sage-700 transition-all flex items-center gap-3"
                  >
                    {user ? "Open Dashboard" : "Get started free"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticWrapper>
                <MagneticWrapper>
                  <a
                    href="#how-it-works"
                    className="px-8 py-4 bg-white dark:bg-neutral-800 border-2 border-warm-200 dark:border-neutral-700 text-warm-700 dark:text-neutral-200 rounded-2xl font-medium text-lg hover:border-warm-300 dark:hover:border-neutral-600 hover:bg-warm-50 dark:hover:bg-neutral-700 transition-all flex items-center gap-3"
                  >
                    <Play className="w-5 h-5" />
                    See how it works
                  </a>
                </MagneticWrapper>
              </motion.div>
              
              {/* Trust indicators */}
              <motion.div
                className="flex items-center gap-8 text-warm-500 dark:text-neutral-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  { icon: Check, text: 'Free to use' },
                  { icon: Shield, text: 'Privacy first' },
                  { icon: Zap, text: '2-second capture' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                    <span className="text-sm font-medium">{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </div>
            
            {/* Right - Interactive Phone */}
            <motion.div 
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            >
              <InteractivePhone activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-warm-400 dark:text-neutral-500" />
        </motion.div>
      </section>

      {/* How It Works - Bento Grid */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll className="text-center mb-16">
            <p className="text-sage-600 dark:text-sage-400 font-semibold mb-4 tracking-wide uppercase text-sm">How It Works</p>
            <h2 className="text-display text-3xl md:text-4xl text-warm-900 dark:text-neutral-100 mb-4">
              Three steps to better health insights
            </h2>
            <p className="text-lg text-warm-500 dark:text-neutral-400 max-w-2xl mx-auto">
              No calorie counting. No food diaries. Just snap and forget.
            </p>
          </RevealOnScroll>
          
          {/* Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 - Large */}
            <RevealOnScroll delay={0.1} className="lg:col-span-2">
              <BentoCard className="p-8 h-full min-h-[400px] bg-gradient-to-br from-sage-600 to-sage-800">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-bold text-white/80">Step 1</div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Capture your meals</h3>
                  <p className="text-lg text-white/80 mb-8 max-w-md">
                    Just take a photo. Our AI identifies foods, estimates portions, and flags concerns—all in under 2 seconds.
                  </p>
                  <div className="mt-auto flex items-center gap-4">
                    <motion.div 
                      className="flex -space-x-3"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {['🍕', '🥗', '🍜', '🍔'].map((emoji, i) => (
                        <motion.div 
                          key={i}
                          className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-xl border-2 border-white/30"
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </motion.div>
                    <span className="text-white/60 text-sm">AI analyzes any cuisine</span>
                  </div>
                </div>
              </BentoCard>
            </RevealOnScroll>
            
            {/* Card 2 */}
            <RevealOnScroll delay={0.2}>
              <BentoCard className="p-8 h-full min-h-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <BellOff className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-sm font-bold text-warm-400 dark:text-neutral-500">Step 2</div>
                  </div>
                  <h3 className="text-2xl font-bold text-warm-900 dark:text-neutral-100 mb-4">Forget about it</h3>
                  <p className="text-warm-600 dark:text-neutral-400 mb-8">
                    No notifications. No streaks. No guilt. Your data quietly builds in the background.
                  </p>
                  <div className="mt-auto">
                    <div className="bg-warm-50 dark:bg-neutral-800 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-neutral-700 flex items-center justify-center">
                          <X className="w-4 h-4 text-warm-500 dark:text-neutral-400" />
                        </div>
                        <span className="text-sm text-warm-500 dark:text-neutral-500 line-through">Daily reminders</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warm-200 dark:bg-neutral-700 flex items-center justify-center">
                          <X className="w-4 h-4 text-warm-500 dark:text-neutral-400" />
                        </div>
                        <span className="text-sm text-warm-500 dark:text-neutral-500 line-through">Calorie counting</span>
                      </div>
                    </div>
                  </div>
                </div>
              </BentoCard>
            </RevealOnScroll>
            
            {/* Card 3 */}
            <RevealOnScroll delay={0.3}>
              <BentoCard className="p-8 h-full min-h-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-sm font-bold text-warm-400 dark:text-neutral-500">Step 3</div>
                  </div>
                  <h3 className="text-2xl font-bold text-warm-900 dark:text-neutral-100 mb-4">See hidden patterns</h3>
                  <p className="text-warm-600 dark:text-neutral-400 mb-8">
                    Discover insights no other app tracks—plastic exposure, processed foods, late eating patterns.
                  </p>
                  <div className="mt-auto space-y-3">
                    {[
                      { label: 'Plastic bottles', value: 12, max: 20, color: 'bg-blue-500' },
                      { label: 'Processed meat', value: 8, max: 20, color: 'bg-rose-500' },
                      { label: 'Late meals', value: 5, max: 20, color: 'bg-violet-500' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-warm-500 dark:text-neutral-500">{item.label}</span>
                          <span className="text-warm-700 dark:text-neutral-300 font-medium">{item.value}</span>
                        </div>
                        <div className="h-2 bg-warm-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full ${item.color} rounded-full`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(item.value / item.max) * 100}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </BentoCard>
            </RevealOnScroll>
            
            {/* Card 4 - Full width */}
            <RevealOnScroll delay={0.4} className="lg:col-span-2">
              <BentoCard className="p-8 h-full min-h-[300px] bg-gradient-to-br from-warm-900 to-warm-800">
                <div className="flex flex-col md:flex-row gap-8 h-full items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-sm font-bold text-white/60">Final Step</div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Share with your doctor</h3>
                    <p className="text-lg text-white/70 mb-6">
                      Generate a professional PDF report with AI-powered insights, perfect for medical appointments.
                    </p>
                    <motion.button 
                      className="px-6 py-3 bg-white text-warm-900 rounded-xl font-medium text-sm flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FileText className="w-4 h-4" />
                      See sample report
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="w-full md:w-64 h-48 bg-white/10 backdrop-blur rounded-2xl p-4">
                    <div className="h-full flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-white/60" />
                        <span className="text-xs text-white/60">Doctor Report</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[85, 92, 78, 95, 82].map((width, i) => (
                          <motion.div 
                            key={i}
                            className="h-2 bg-white/20 rounded-full"
                            style={{ width: `${width}%` }}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </BentoCard>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll>
            <div className="bg-gradient-to-br from-sage-600 via-sage-700 to-sage-800 rounded-[40px] p-12 md:p-16 relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '32px 32px'
                }} />
              </div>
              
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-display text-3xl md:text-4xl text-white mb-4">
                    Built for long-term health
                  </h2>
                  <p className="text-lg text-white/70">The more you use it, the more valuable it becomes</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-8">
                  {[
                    { value: 2, suffix: 'sec', label: 'Average capture time' },
                    { value: 18, suffix: '+', label: 'Unique insights tracked' },
                    { value: 100, suffix: '%', label: 'Privacy focused' },
                    { value: 0, suffix: '', label: 'Notifications sent', prefix: '' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i}
                      className="text-center"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                        <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                      </div>
                      <p className="text-white/60">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Doctor Communication Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-warm-50/50 dark:from-neutral-900/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - PDF Preview */}
            <RevealOnScroll>
              <div className="relative">
                {/* PDF Document Mockup */}
                <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-warm-900/10 dark:shadow-black/30 p-8 border border-warm-100 dark:border-neutral-800">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-warm-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <img
                        src="/icon-192.png"
                        alt="DataDiet"
                        className="w-10 h-10 rounded-xl"
                      />
                      <div>
                        <p className="font-semibold text-warm-900 dark:text-neutral-100">Dietary Report</p>
                        <p className="text-xs text-warm-500 dark:text-neutral-500">Generated for Dr. Smith</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-warm-400 dark:text-neutral-500">Report Date</p>
                      <p className="text-sm font-medium text-warm-700 dark:text-neutral-300">Jan 17, 2025</p>
                    </div>
                  </div>

                  {/* Patient Summary */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-warm-900 dark:text-neutral-100 mb-3">Patient Summary</h3>
                    <div className="bg-warm-50 dark:bg-neutral-800 rounded-xl p-4">
                      <p className="text-sm text-warm-600 dark:text-neutral-400 leading-relaxed">
                        Patient logged <span className="font-semibold text-warm-900 dark:text-neutral-200">18 meals</span> over a 2-week period.
                        Analysis reveals moderate concerns regarding processed meat consumption and late-night eating patterns
                        that may warrant discussion.
                      </p>
                    </div>
                  </div>
                  
                  {/* Key Metrics */}
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-warm-900 dark:text-neutral-100 mb-3">Key Findings</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center border border-amber-100 dark:border-amber-800/30">
                        <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">6</p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-500">Processed Meat Servings</p>
                      </div>
                      <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 text-center border border-rose-100 dark:border-rose-800/30">
                        <p className="text-2xl font-bold text-rose-700 dark:text-rose-400">28%</p>
                        <p className="text-[10px] text-rose-600 dark:text-rose-500">Late Night Meals</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-800/30">
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">10</p>
                        <p className="text-[10px] text-blue-600 dark:text-blue-500">Plastic Bottles</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-sm font-semibold text-warm-900 dark:text-neutral-100 mb-3">AI Recommendations</h3>
                    <ul className="space-y-2">
                      {[
                        'Consider reducing processed meat to under 4 servings/week',
                        'Shift dinner time earlier to improve metabolic health',
                        'Switch to glass or stainless steel water bottles'
                      ].map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-warm-600 dark:text-neutral-400">
                          <Check className="w-4 h-4 text-sage-600 dark:text-sage-400 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Floating badge */}
                <motion.div 
                  className="absolute -top-4 -right-4 bg-sage-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  PDF Export Ready
                </motion.div>
              </div>
            </RevealOnScroll>
            
            {/* Right - Content */}
            <RevealOnScroll delay={0.2}>
              <div>
                <p className="text-sage-600 dark:text-sage-400 font-semibold mb-4 tracking-wide uppercase text-sm">Doctor Communication</p>
                <h2 className="text-display text-3xl md:text-4xl text-warm-900 dark:text-neutral-100 mb-6">
                  Share meaningful data with your healthcare provider
                </h2>
                <p className="text-lg text-warm-600 dark:text-neutral-400 mb-8 leading-relaxed">
                  Generate professional PDF reports that your doctor will actually find useful.
                  No more "What have you been eating?" — now you have the data to show them.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { title: 'AI-Generated Summaries', desc: 'Clear, medical-friendly language' },
                    { title: 'Visual Data', desc: 'Charts and metrics at a glance' },
                    { title: 'Pattern Detection', desc: 'Correlations a food diary would miss' },
                    { title: 'One-Click Export', desc: 'Download or share instantly' },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-sage-600 dark:text-sage-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-warm-900 dark:text-neutral-100">{item.title}</p>
                        <p className="text-sm text-warm-500 dark:text-neutral-500">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link
                  href={user ? "/app" : "/login"}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-warm-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl font-medium hover:bg-warm-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  {user ? "Open Dashboard" : "Try it free"}
                </Link>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <RevealOnScroll className="text-center mb-16">
            <p className="text-sage-600 dark:text-sage-400 font-semibold mb-4 tracking-wide uppercase text-sm">Why It&apos;s Different</p>
            <h2 className="text-display text-3xl md:text-4xl text-warm-900 dark:text-neutral-100 mb-6">
              Not another calorie counter
            </h2>
            <p className="text-lg text-warm-500 dark:text-neutral-400 max-w-2xl mx-auto">
              We track what actually matters for your long-term health.
            </p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                icon: Droplets,
                title: 'Plastic Exposure',
                description: 'Track how often you drink from plastic bottles—a metric linked to microplastic consumption.',
                color: 'bg-blue-100 dark:bg-blue-900/30',
                iconColor: 'text-blue-600 dark:text-blue-400'
              },
              {
                icon: Beef,
                title: 'Processed Meat',
                description: 'Monitor your processed meat intake, a WHO Group 1 carcinogen when consumed frequently.',
                color: 'bg-rose-100 dark:bg-rose-900/30',
                iconColor: 'text-rose-600 dark:text-rose-400'
              },
              {
                icon: Moon,
                title: 'Late Night Eating',
                description: 'See how often you eat after 9pm—linked to metabolic issues and poor sleep quality.',
                color: 'bg-violet-100 dark:bg-violet-900/30',
                iconColor: 'text-violet-600 dark:text-violet-400'
              },
              {
                icon: Clock,
                title: 'Meal Timing',
                description: 'Understand your eating patterns and their impact on circadian rhythm.',
                color: 'bg-amber-100 dark:bg-amber-900/30',
                iconColor: 'text-amber-600 dark:text-amber-400'
              },
              {
                icon: Activity,
                title: 'Pattern Detection',
                description: 'AI spots correlations between your diet and how you feel over time.',
                color: 'bg-emerald-100 dark:bg-emerald-900/30',
                iconColor: 'text-emerald-600 dark:text-emerald-400'
              },
              {
                icon: ShieldCheck,
                title: 'Privacy First',
                description: 'Your data stays on your device. We never sell or share your information.',
                color: 'bg-sage-100 dark:bg-sage-900/30',
                iconColor: 'text-sage-600 dark:text-sage-400'
              }
            ].map((feature, i) => (
              <RevealOnScroll key={i} delay={i * 0.1}>
                <motion.div
                  className="p-8 bg-white dark:bg-neutral-900 rounded-3xl border border-warm-100 dark:border-neutral-800 h-full"
                  whileHover={{ y: -2, boxShadow: '0 16px 32px -8px rgba(0,0,0,0.06)' }}
                >
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-warm-900 dark:text-neutral-100 mb-3">{feature.title}</h3>
                  <p className="text-warm-600 dark:text-neutral-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <RevealOnScroll>
            <motion.div
              className="bg-gradient-to-br from-warm-50 to-sage-50 dark:from-neutral-900 dark:to-neutral-800 rounded-[40px] p-12 md:p-20 relative overflow-hidden border border-transparent dark:border-neutral-800"
              whileHover={{ boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)' }}
            >
              {/* Decorative elements */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-sage-200/50 dark:bg-sage-900/30 rounded-full blur-2xl" />
              <div className="absolute bottom-8 left-8 w-32 h-32 bg-blue-200/50 dark:bg-blue-900/30 rounded-full blur-2xl" />

              <div className="relative z-10">
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-sage-500 to-sage-700 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-sage-500/25"
                  whileHover={{ rotate: 10, scale: 1.05 }}
                >
                  <Heart className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-display text-4xl md:text-5xl text-warm-900 dark:text-neutral-100 mb-6">
                  Start building your health history
                </h2>
                <p className="text-xl text-warm-600 dark:text-neutral-400 mb-10 max-w-xl mx-auto">
                  Join thousands who are passively building a dietary record they&apos;ll thank themselves for later.
                </p>

                <MagneticWrapper className="inline-block">
                  <Link
                    href={user ? "/app" : "/login"}
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-sage-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-sage-600/25 hover:bg-sage-700 transition-all"
                  >
                    {user ? "Open Dashboard" : "Get started — it's free"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </MagneticWrapper>

                {!user && <p className="text-warm-500 dark:text-neutral-500 text-sm mt-6">No credit card required</p>}
              </div>
            </motion.div>
          </RevealOnScroll>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-warm-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/icon-192.png"
                alt="DataDiet"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-warm-600 dark:text-neutral-400">DataDiet</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-warm-500 dark:text-neutral-500">
              <Link href="/login" className="hover:text-warm-700 dark:hover:text-neutral-300 transition-colors">Get Started</Link>
              <a href="#how-it-works" className="hover:text-warm-700 dark:hover:text-neutral-300 transition-colors">How It Works</a>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
