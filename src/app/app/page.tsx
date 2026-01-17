'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MealCard } from '@/components/MealCard';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  BarChart3, 
  FileText, 
  RefreshCw, 
  Sparkles, 
  ArrowRight, 
  Droplets, 
  Beef, 
  Moon, 
  Clock,
  Activity,
  ChevronRight,
  Calendar,
  Shield,
  Cloud,
  LogOut,
  Flame,
  Thermometer,
  Package,
  Zap,
  Coffee,
  Wine
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/services/auth';

// Animated number counter
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    if (isInView) {
      const duration = 1500;
      const steps = 40;
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
  
  return <span ref={ref}>{displayValue}{suffix}</span>;
}

// Circular progress ring
function ProgressRing({ progress, size = 80, strokeWidth = 6, color = 'sage' }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  const colorMap: Record<string, string> = {
    sage: '#5c7a5c',
    blue: '#3b82f6',
    rose: '#f43f5e',
    amber: '#f59e0b',
    violet: '#8b5cf6',
  };
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-warm-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-warm-800">{progress}%</span>
      </div>
    </div>
  );
}

// Stagger container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Weekly Activity Heatmap Component (GitHub-style)
function WeeklyHeatmap({ meals }: { meals: any[] }) {
  const today = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate last 4 weeks of data
  const weeks = 4;
  const grid: { date: Date; count: number; isToday: boolean }[][] = [];
  
  for (let w = weeks - 1; w >= 0; w--) {
    const week: { date: Date; count: number; isToday: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (w * 7) - (today.getDay() - d));
      
      const count = meals.filter(m => {
        const mealDate = new Date(m.loggedAt);
        return mealDate.toDateString() === date.toDateString();
      }).length;
      
      week.push({
        date,
        count,
        isToday: date.toDateString() === today.toDateString(),
      });
    }
    grid.push(week);
  }
  
  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-warm-100 dark:bg-neutral-800';
    if (count === 1) return 'bg-teal-200 dark:bg-teal-900';
    if (count === 2) return 'bg-teal-400 dark:bg-teal-700';
    if (count >= 3) return 'bg-teal-600 dark:bg-teal-500';
    return 'bg-warm-100 dark:bg-neutral-800';
  };
  
  return (
    <div className="space-y-2">
      <div className="flex gap-1 pl-8">
        {days.map(day => (
          <div key={day} className="w-8 text-center text-[10px] font-medium text-warm-400 dark:text-neutral-500 uppercase">
            {day.charAt(0)}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {grid.map((week, wi) => (
          <div key={wi} className="flex items-center gap-1">
            <span className="w-7 text-[10px] text-warm-400 dark:text-neutral-500 text-right">
              {wi === 0 ? '4w' : wi === 1 ? '3w' : wi === 2 ? '2w' : '1w'}
            </span>
            {week.map((day, di) => (
              <motion.div
                key={di}
                className={`w-8 h-8 rounded-lg ${getIntensity(day.count)} ${day.isToday ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-neutral-900' : ''} cursor-default relative group`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.02, duration: 0.2 }}
                whileHover={{ scale: 1.15 }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none"
                  style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
                >
                  {day.count} meal{day.count !== 1 ? 's' : ''} • {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #1a1a1a' }} />
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-[10px] text-warm-400 dark:text-neutral-500">Less</span>
        <div className="flex gap-1">
          {['bg-warm-100 dark:bg-neutral-800', 'bg-teal-200 dark:bg-teal-900', 'bg-teal-400 dark:bg-teal-700', 'bg-teal-600 dark:bg-teal-500'].map((color, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
          ))}
        </div>
        <span className="text-[10px] text-warm-400 dark:text-neutral-500">More</span>
      </div>
    </div>
  );
}

// Meal Time Distribution Component
function MealTimeDistribution({ meals }: { meals: any[] }) {
  const timeSlots = [
    { label: 'Morning', range: '6am-11am', icon: '🌅', start: 6, end: 11 },
    { label: 'Midday', range: '11am-2pm', icon: '☀️', start: 11, end: 14 },
    { label: 'Afternoon', range: '2pm-6pm', icon: '🌤️', start: 14, end: 18 },
    { label: 'Evening', range: '6pm-9pm', icon: '🌆', start: 18, end: 21 },
    { label: 'Night', range: '9pm-6am', icon: '🌙', start: 21, end: 6 },
  ];
  
  const distribution = timeSlots.map(slot => {
    const count = meals.filter(m => {
      const hour = new Date(m.loggedAt).getHours();
      if (slot.start > slot.end) {
        return hour >= slot.start || hour < slot.end;
      }
      return hour >= slot.start && hour < slot.end;
    }).length;
    return { ...slot, count };
  });
  
  const maxCount = Math.max(...distribution.map(d => d.count), 1);
  
  return (
    <div className="space-y-3">
      {distribution.map((slot, i) => (
        <motion.div 
          key={slot.label}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <span className="text-lg">{slot.icon}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-warm-700 dark:text-neutral-300">{slot.label}</span>
              <span className="text-xs text-warm-400 dark:text-neutral-500">{slot.count}</span>
            </div>
            <div className="h-2 bg-warm-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${(slot.count / maxCount) * 100}%` }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function AppDashboard() {
  const { meals, insights, isLoading, isSyncing, loadDemoData, user } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </div>
          <p className="text-warm-500 font-medium">Loading your data...</p>
        </motion.div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return '🌙';
    if (hour < 12) return '☀️';
    if (hour < 18) return '🌤️';
    return '🌙';
  };

  // Calculate health score (mock - based on available data)
  const healthScore = meals.length > 0 
    ? Math.min(100, Math.max(40, 100 - insights.processedMeat.count * 5 - insights.plastic.count * 2 - insights.mealTiming.lateMealPercent * 0.3))
    : 0;

  // Helper to count flag occurrences
  const countFlagOccurrences = (flag: string) => {
    return meals.reduce((count, meal) => {
      return count + (meal.flags.includes(flag as any) ? 1 : 0);
    }, 0);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#f5f5f5] dark:bg-neutral-950"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-start justify-between">
          <div>
            <motion.div 
              className="flex items-center gap-2 text-warm-400 dark:text-neutral-400 text-sm mb-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Calendar className="w-4 h-4" />
              {formatDate(currentTime)}
            </motion.div>
            <h1 className="text-display text-3xl md:text-4xl text-warm-900 dark:text-white mb-2">
              {getGreeting()}{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} {getTimeEmoji()}
            </h1>
            <p className="text-warm-500 dark:text-neutral-400 text-lg flex items-center gap-2">
              {meals.length > 0 
                ? `You've logged ${insights.totalMeals} meals • ${insights.dateRange}`
                : 'Start capturing your meals to build your dietary history'
              }
              {/* Sync status indicator */}
              {user && (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isSyncing 
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' 
                    : 'bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
                }`}>
                  {isSyncing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Cloud className="w-3 h-3" />
                      </motion.div>
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Cloud className="w-3 h-3" />
                      Synced
                    </>
                  )}
                </span>
              )}
            </p>
          </div>
          {/* User info and Sign Out */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            {user?.photoURL && (
              <div className="relative hidden sm:block">
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-12 h-12 rounded-xl shadow-lg ring-2 ring-white dark:ring-neutral-700"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-neutral-800" />
              </div>
            )}
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-warm-100 dark:bg-neutral-800 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-warm-600 dark:text-neutral-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-medium text-sm transition-all disabled:opacity-50 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Health Overview - Only show if meals exist */}
      {meals.length > 0 && (
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-warm-100 dark:border-neutral-800 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-6 p-6">
              {/* Health Score */}
              <div className="flex items-center gap-6">
                <ProgressRing progress={Math.round(healthScore)} size={100} strokeWidth={8} color="sage" />
                <div>
                  <h3 className="text-sm font-medium text-warm-500 dark:text-neutral-400 mb-1">Health Score</h3>
                  <p className="text-2xl font-bold text-warm-900 dark:text-white">
                    {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : healthScore >= 40 ? 'Fair' : 'Needs Work'}
                  </p>
                  <p className="text-sm text-warm-400 dark:text-neutral-500">Based on your patterns</p>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-20 bg-warm-200 dark:bg-neutral-700" />

              {/* Quick Stats Row */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">Meals Logged</p>
                  <p className="text-2xl font-bold text-warm-900 dark:text-white">
                    <AnimatedNumber value={insights.totalMeals} />
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">This Week</p>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    <AnimatedNumber value={Math.min(meals.length, 7)} />
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">Streak</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    <AnimatedNumber value={Math.min(meals.length, 5)} suffix=" days" />
                  </p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-warm-500 dark:text-neutral-400 mb-1">Avg/Day</p>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {(insights.totalMeals / Math.max(1, 7)).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Cards - Matching iOS App */}
      {meals.length > 0 && (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
        >
          {[
            { 
              icon: Clock, 
              value: insights.totalMeals, 
              label: 'Meals Logged', 
              bgFrom: 'from-sage-500',
              bgTo: 'to-sage-700',
              good: true,
            },
            { 
              icon: Droplets, 
              value: insights.plastic.count, 
              label: 'Plastic Exposure', 
              subLabel: `${insights.plastic.perDay.toFixed(1)}/day`,
              bgFrom: 'from-cyan-500',
              bgTo: 'to-teal-600',
              alert: insights.plastic.count > 10,
            },
            { 
              icon: Thermometer, 
              value: countFlagOccurrences('plastic_container_hot'), 
              label: 'Hot in Plastic', 
              subLabel: `${(countFlagOccurrences('plastic_container_hot') / Math.max(meals.length, 1)).toFixed(1)}/day`,
              bgFrom: 'from-orange-500',
              bgTo: 'to-orange-700',
              alert: countFlagOccurrences('plastic_container_hot') > 5,
            },
            { 
              icon: Beef, 
              value: insights.processedMeat.count, 
              label: 'Processed Meat', 
              subLabel: `${insights.processedMeat.perWeek.toFixed(1)}/week`,
              bgFrom: 'from-rose-500',
              bgTo: 'to-rose-700',
              alert: insights.processedMeat.count > 5,
            },
            { 
              icon: Flame, 
              value: countFlagOccurrences('charred_grilled'), 
              label: 'Charred/Grilled', 
              subLabel: `${(countFlagOccurrences('charred_grilled') / Math.max(meals.length / 7, 1)).toFixed(1)}/week`,
              bgFrom: 'from-red-500',
              bgTo: 'to-red-700',
              alert: countFlagOccurrences('charred_grilled') > 7,
            },
            { 
              icon: Package, 
              value: countFlagOccurrences('ultra_processed'), 
              label: 'Ultra Processed', 
              subLabel: `${(countFlagOccurrences('ultra_processed') / Math.max(meals.length / 7, 1)).toFixed(1)}/week`,
              bgFrom: 'from-amber-500',
              bgTo: 'to-amber-700',
              alert: countFlagOccurrences('ultra_processed') > 10,
            },
            { 
              icon: Zap, 
              value: countFlagOccurrences('fried'), 
              label: 'Fried Foods', 
              subLabel: `${(countFlagOccurrences('fried') / Math.max(meals.length / 7, 1)).toFixed(1)}/week`,
              bgFrom: 'from-yellow-500',
              bgTo: 'to-yellow-600',
              alert: countFlagOccurrences('fried') > 7,
            },
            { 
              icon: Moon, 
              value: insights.mealTiming.lateMealPercent, 
              label: 'Late Meals', 
              suffix: '%',
              bgFrom: 'from-violet-500',
              bgTo: 'to-violet-700',
              alert: insights.mealTiming.lateMealPercent > 30,
            },
          ].map((stat) => (
            <motion.div 
              key={stat.label}
              className="relative group"
              variants={itemVariants}
            >
              <div className={`bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${stat.alert ? 'border-l-4 border-l-rose-400' : 'border-l-4 border-l-teal-400'}`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.alert ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-teal-50 dark:bg-teal-900/20'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-5 h-5 ${stat.alert ? 'text-rose-500' : 'text-teal-600'}`} />
                    </div>
                    {stat.alert && (
                      <motion.div 
                        className="w-2.5 h-2.5 rounded-full bg-rose-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                    {stat.good && (
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <p className="text-xs text-warm-500 dark:text-neutral-400 mb-0.5">{stat.label}</p>
                  <p className="text-2xl font-bold text-warm-900 dark:text-white">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                  </p>
                  {stat.subLabel && (
                    <p className="text-[10px] text-warm-400 dark:text-neutral-500">{stat.subLabel}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Activity Overview - NEW FEATURE */}
      {meals.length > 0 && (
        <motion.div 
          className="grid md:grid-cols-2 gap-4 mb-8"
          variants={containerVariants}
        >
          {/* Weekly Activity Heatmap */}
          <motion.div 
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 p-6"
            variants={itemVariants}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-warm-900 dark:text-white">Activity</h3>
                  <p className="text-xs text-warm-400 dark:text-neutral-500">Last 4 weeks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {Math.min(meals.length, 7)} day streak
                </span>
              </div>
            </div>
            <WeeklyHeatmap meals={meals} />
          </motion.div>

          {/* Meal Time Distribution */}
          <motion.div 
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 p-6"
            variants={itemVariants}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-warm-900 dark:text-white">Meal Timing</h3>
                <p className="text-xs text-warm-400 dark:text-neutral-500">When you eat</p>
              </div>
            </div>
            <MealTimeDistribution meals={meals} />
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div 
        className="grid md:grid-cols-3 gap-4 mb-10"
        variants={containerVariants}
      >
        {[
          {
            href: '/app/capture',
            icon: Camera,
            title: 'Log a Meal',
            subtitle: '2-second photo capture',
            gradient: 'from-sage-400 to-sage-600',
            shadow: 'shadow-sage-200',
            hoverColor: 'hover:border-sage-300',
          },
          {
            href: '/app/insights',
            icon: BarChart3,
            title: 'View Insights',
            subtitle: 'Patterns & analysis',
            gradient: 'from-amber-400 to-amber-600',
            shadow: 'shadow-amber-200',
            hoverColor: 'hover:border-amber-300',
          },
          {
            href: '/app/report',
            icon: FileText,
            title: 'Doctor Report',
            subtitle: 'AI-generated PDF',
            gradient: 'from-violet-400 to-violet-600',
            shadow: 'shadow-violet-200',
            hoverColor: 'hover:border-violet-300',
          },
        ].map((action) => (
          <motion.div key={action.href} variants={itemVariants} className="h-full">
            <Link href={action.href} className="group block h-full">
              <motion.div 
                className={`card-elevated h-full min-h-[100px] border-2 border-transparent ${action.hoverColor} transition-all duration-300`}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4 p-5 h-full">
                  <motion.div 
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-lg ${action.shadow} flex-shrink-0`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <action.icon className="w-7 h-7" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-warm-900 text-lg">{action.title}</h3>
                    <p className="text-sm text-warm-500">{action.subtitle}</p>
                  </div>
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0"
                    whileHover={{ x: 5, backgroundColor: 'rgba(92, 122, 92, 0.1)' }}
                  >
                    <ArrowRight className="w-5 h-5 text-warm-400 group-hover:text-sage-600 transition-colors" />
                  </motion.div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Meals */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-warm-900">Recent Meals</h2>
            <p className="text-sm text-warm-400">Your latest captures</p>
          </div>
          {meals.length === 0 && (
            <motion.button
              onClick={loadDemoData}
              className="btn btn-secondary btn-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              Load Demo Data
            </motion.button>
          )}
          {meals.length > 5 && (
            <Link href="/app/insights" className="text-sm text-sage-600 hover:text-sage-700 font-medium flex items-center gap-1">
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        <AnimatePresence mode="wait">
          {meals.length === 0 ? (
            <motion.div 
              className="card-elevated text-center py-20 overflow-hidden relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-sage-500" />
                <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-amber-500" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-violet-500" />
              </div>
              
              <motion.div 
                className="relative z-10"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sage-100 to-sage-200 flex items-center justify-center mx-auto mb-6"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Sparkles className="w-12 h-12 text-sage-500" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-warm-800 mb-3">No meals logged yet</h3>
                <p className="text-warm-500 mb-8 max-w-sm mx-auto text-lg">
                  Start by logging your first meal. No calories shown — just capture and forget.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/app/capture" className="btn btn-primary btn-lg inline-flex">
                    <Camera className="w-5 h-5" />
                    Log Your First Meal
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {meals.slice(0, 5).map((meal, i) => (
                <motion.div
                  key={meal.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, x: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MealCard meal={meal} />
                </motion.div>
              ))}
              {meals.length > 5 && (
                <motion.div 
                  className="text-center pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link 
                    href="/app/insights" 
                    className="text-sm text-warm-500 hover:text-sage-600 transition-colors inline-flex items-center gap-2"
                  >
                    <span>+ {meals.length - 5} more meals logged</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Insights Preview */}
      {meals.length > 0 && (
        <motion.div 
          className="grid md:grid-cols-2 gap-4 mb-8"
          variants={containerVariants}
        >
          {/* Tip Card */}
          <motion.div 
            className="card-elevated bg-gradient-to-br from-sage-50 via-white to-emerald-50 border border-sage-200/50"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center flex-shrink-0 text-white"
                  whileHover={{ rotate: 15 }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-sage-800 mb-2 text-lg">Pro Tip</h3>
                  <p className="text-sage-700">
                    The more meals you log over time, the more valuable your insights become. 
                    We recommend logging for at least 2 weeks before generating your first doctor report.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Report Ready Card */}
          <motion.div 
            className="card-elevated bg-gradient-to-br from-violet-50 via-white to-purple-50 border border-violet-200/50"
            variants={itemVariants}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center flex-shrink-0 text-white"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield className="w-6 h-6" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-violet-800 mb-2 text-lg">
                    {insights.totalMeals >= 14 ? 'Report Ready!' : `${14 - insights.totalMeals} meals to go`}
                  </h3>
                  <p className="text-violet-700 mb-3">
                    {insights.totalMeals >= 14 
                      ? 'You have enough data for a comprehensive doctor report.'
                      : `Log ${14 - insights.totalMeals} more meals to unlock your full doctor report.`
                    }
                  </p>
                  {insights.totalMeals >= 14 && (
                    <Link 
                      href="/app/report" 
                      className="text-sm font-medium text-violet-600 hover:text-violet-700 inline-flex items-center gap-1"
                    >
                      Generate Report
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
    </motion.div>
  );
}
