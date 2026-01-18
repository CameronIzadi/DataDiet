'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
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
  Sun,
  Image as ImageIcon,
  Sparkles
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

// Magnetic hover effect - enhanced with stronger pull and scale
function MagneticWrapper({ children, className = '', strength = 0.15 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });
  const springScale = useSpring(scale, { stiffness: 300, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * strength);
      y.set((e.clientY - centerY) * strength);
      scale.set(1.02);
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY, scale: springScale }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); scale.set(1); }}
    >
      {children}
    </motion.div>
  );
}

// Animated border button - glowing animated border effect
function AnimatedBorderButton({
  children,
  href,
  className = '',
  variant = 'primary'
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  variant?: 'primary' | 'secondary';
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isPrimary = variant === 'primary';

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[2px] rounded-2xl opacity-0"
        style={{
          background: isPrimary
            ? 'linear-gradient(90deg, #4caf93, #10b981, #4caf93, #10b981)'
            : 'linear-gradient(90deg, #d4d4d4, #a3a3a3, #d4d4d4, #a3a3a3)',
          backgroundSize: '300% 100%',
        }}
        animate={{
          opacity: isHovered ? 1 : 0,
          backgroundPosition: isHovered ? ['0% center', '100% center'] : '0% center',
        }}
        transition={{
          opacity: { duration: 0.2 },
          backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
        }}
      />
      {/* Inner background */}
      <div
        className={`absolute inset-[2px] rounded-[14px] ${
          isPrimary
            ? 'bg-sage-600 group-hover:bg-sage-700'
            : 'bg-white dark:bg-neutral-800 group-hover:bg-warm-50 dark:group-hover:bg-neutral-700'
        } transition-colors`}
      />
      {/* Content */}
      <span className={`relative z-10 flex items-center gap-3 ${
        isPrimary ? 'text-white' : 'text-warm-700 dark:text-neutral-200'
      }`}>
        {children}
      </span>
    </Link>
  );
}

// Shimmer text effect - adds a moving shine across text
function ShimmerText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        style={{ backgroundSize: '200% 100%' }}
        animate={{ backgroundPosition: ['-100% center', '200% center'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
      />
    </span>
  );
}

// Glow button - premium button with radial glow effect on hover
function GlowButton({
  children,
  href,
  className = ''
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className={`group relative px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300 flex items-center gap-3 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-sage-400 via-emerald-400 to-sage-400 opacity-0 blur-lg"
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
      />
      {/* Button background */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-sage-600"
        animate={{
          scale: isHovered ? 1.02 : 1,
          backgroundColor: isHovered ? '#3d8b6e' : '#4caf93'
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Content */}
      <span className="relative z-10 text-white flex items-center gap-3">
        {children}
      </span>
    </Link>
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
// PHASE 1: PREMIUM ENTRANCE ANIMATIONS
// ============================================

// Staggered word reveal - words animate in one by one with spring physics
function StaggeredWords({
  text,
  className = '',
  baseDelay = 0,
  staggerDelay = 0.08,
  isGradient = false
}: {
  text: string;
  className?: string;
  baseDelay?: number;
  staggerDelay?: number;
  isGradient?: boolean;
}) {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: baseDelay,
      },
    },
  };

  const wordAnimation = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 20,
        stiffness: 100,
      },
    },
  };

  const gradientClass = isGradient
    ? 'bg-gradient-to-r from-sage-600 via-emerald-500 to-sage-600 bg-clip-text text-transparent bg-[length:200%_auto]'
    : '';

  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordAnimation}
          className={`inline-block mr-[0.25em] ${gradientClass}`}
          style={isGradient ? {
            backgroundSize: '200% auto',
            animation: 'gradient-shift 8s linear infinite',
          } : {}}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

// Orchestrated entrance - coordinates multiple elements with precise timing
function OrchestratedEntrance({
  children,
  index = 0,
  baseDelay = 0.1,
  className = ''
}: {
  children: React.ReactNode;
  index?: number;
  baseDelay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        delay: baseDelay + (index * 0.12),
        duration: 0.6,
        ease: [0.25, 0.4, 0.25, 1], // Custom cubic-bezier for smooth feel
      }}
    >
      {children}
    </motion.div>
  );
}

// Floating phone with responsive shadow - premium product showcase
function FloatingPhone({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const y = useMotionValue(0);
  const shadowY = useTransform(y, [-8, 8], [15, 25]);
  const shadowBlur = useTransform(y, [-8, 8], [30, 50]);
  const shadowOpacity = useTransform(y, [-8, 8], [0.2, 0.35]);

  return (
    <motion.div
      className={className}
      style={{ y }}
      animate={{ y: [-8, 8, -8] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        style={{
          boxShadow: useTransform(
            [shadowY, shadowBlur, shadowOpacity],
            ([y, blur, opacity]) => `0 ${y}px ${blur}px rgba(0, 0, 0, ${opacity})`
          ),
        }}
        className="rounded-[40px]"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Trust indicator with staggered entrance
function TrustIndicator({
  icon: Icon,
  text,
  index
}: {
  icon: React.ElementType;
  text: string;
  index: number;
}) {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: 0.8 + (index * 0.1),
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 0.9 + (index * 0.1),
          type: 'spring',
          stiffness: 200,
          damping: 15,
        }}
      >
        <Icon className="w-4 h-4 text-sage-600 dark:text-sage-400" />
      </motion.div>
      <span className="text-sm font-medium">{text}</span>
    </motion.div>
  );
}

// ============================================
// PHASE 2: SCROLL-DRIVEN ANIMATIONS
// ============================================

// Parallax layer - moves at different speed than scroll
function ParallaxOrb({
  className,
  speed = 0.3,
  scale = [1, 1.1, 1],
  opacity = [0.5, 0.7, 0.5],
  duration = 8
}: {
  className: string;
  speed?: number;
  scale?: number[];
  opacity?: number[];
  duration?: number;
}) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 1000 * speed]);

  return (
    <motion.div
      className={className}
      style={{ y }}
      animate={{ scale, opacity }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// Staggered grid reveal - cards animate in a wave pattern
function StaggeredGridReveal({
  children,
  className = '',
  baseDelay = 0,
  staggerDelay = 0.1,
  direction = 'up'
}: {
  children: React.ReactNode;
  className?: string;
  baseDelay?: number;
  staggerDelay?: number;
  direction?: 'up' | 'left' | 'right';
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -40, y: 0 };
      case 'right': return { x: 40, y: 0 };
      default: return { x: 0, y: 40 };
    }
  };

  const childArray = React.Children.toArray(children);

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            ...getInitialPosition(),
            filter: 'blur(8px)',
          }}
          animate={isInView ? {
            opacity: 1,
            x: 0,
            y: 0,
            filter: 'blur(0px)',
          } : {}}
          transition={{
            delay: baseDelay + (i * staggerDelay),
            duration: 0.6,
            ease: [0.25, 0.4, 0.25, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Scroll-linked fade - element fades based on scroll progress
function ScrollFade({
  children,
  className = '',
  fadeStart = 0,
  fadeEnd = 300
}: {
  children: React.ReactNode;
  className?: string;
  fadeStart?: number;
  fadeEnd?: number;
}) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [fadeStart, fadeEnd], [1, 0]);
  const scale = useTransform(scrollY, [fadeStart, fadeEnd], [1, 0.95]);

  return (
    <motion.div className={className} style={{ opacity, scale }}>
      {children}
    </motion.div>
  );
}

// Scroll progress indicator - shows reading progress at top of page
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sage-500 via-emerald-500 to-sage-500 origin-left z-[100]"
      style={{ scaleX }}
    />
  );
}

// Enhanced section reveal with scale and blur
function SectionReveal({
  children,
  className = '',
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        y: 60,
        scale: 0.95,
      }}
      animate={isInView ? {
        opacity: 1,
        y: 0,
        scale: 1,
      } : {}}
      transition={{
        delay,
        duration: 0.7,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// STICKY SCROLL SECTION - Framer-style feature showcase
// ============================================

const steps = [
  {
    id: 1,
    title: 'Capture',
    headline: 'Capture your meals',
    description: 'Just take a photo. Our AI identifies foods, estimates portions, and flags concerns—all in under 2 seconds.',
    icon: Camera,
    color: 'sage',
    visual: 'capture',
  },
  {
    id: 2,
    title: 'Forget',
    headline: 'Forget about it',
    description: 'No notifications. No streaks. No guilt. Your data quietly builds in the background while you live your life.',
    icon: BellOff,
    color: 'blue',
    visual: 'forget',
  },
  {
    id: 3,
    title: 'Discover',
    headline: 'See hidden patterns',
    description: 'Discover insights no other app tracks—plastic exposure, processed foods, late eating patterns.',
    icon: TrendingUp,
    color: 'violet',
    visual: 'discover',
  },
  {
    id: 4,
    title: 'Share',
    headline: 'Share with your doctor',
    description: 'Generate a professional PDF report with AI-powered insights, perfect for medical appointments.',
    icon: Stethoscope,
    color: 'warm',
    visual: 'share',
  },
];

function StickyScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [fixedPosition, setFixedPosition] = useState<'before' | 'fixed' | 'after'>('before');
  const [mealCaptured, setMealCaptured] = useState(false);

  // Auto-animate meal capture after 1.5 seconds when on Step 1 AND section is in view
  useEffect(() => {
    if (activeStep === 0 && !mealCaptured && isInView) {
      const timer = setTimeout(() => {
        setMealCaptured(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    // Reset when leaving Step 1 or when section goes out of view
    if (activeStep !== 0 || !isInView) {
      setMealCaptured(false);
    }
  }, [activeStep, mealCaptured, isInView]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const containerTop = rect.top;
      const containerBottom = rect.bottom;
      const windowHeight = window.innerHeight;

      // Determine if section is in view and position mode
      if (containerTop > 0) {
        // Section hasn't reached top yet
        setFixedPosition('before');
        setIsInView(false);
      } else if (containerBottom > windowHeight) {
        // Section is in view - content should be fixed
        setFixedPosition('fixed');
        setIsInView(true);

        // Calculate which step based on scroll progress through the section
        const scrolled = -containerTop;
        const totalScroll = rect.height - windowHeight;
        const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
        const step = Math.min(Math.floor(progress * 4), 3);
        setActiveStep(step);
      } else {
        // Section has scrolled past
        setFixedPosition('after');
        setIsInView(false);
        setActiveStep(3);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative"
      style={{ height: '250vh' }}
    >
      {/* Content container - switches between relative and fixed */}
      <div
        className={`${
          fixedPosition === 'fixed'
            ? 'fixed top-0 left-0 right-0'
            : fixedPosition === 'after'
            ? 'absolute bottom-0 left-0 right-0'
            : 'absolute top-0 left-0 right-0'
        } h-screen bg-[#fafaf9] dark:bg-neutral-950 z-10`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="pt-20 pb-4 px-6 text-center">
            <motion.p
              className="text-sage-600 dark:text-sage-400 font-semibold mb-4 tracking-wide uppercase text-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              How It Works
            </motion.p>
            <motion.h2
              className="text-display text-3xl md:text-4xl text-warm-900 dark:text-neutral-100 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Four steps to better health insights
            </motion.h2>
            <motion.p
              className="text-lg text-warm-500 dark:text-neutral-400 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              No calorie counting. No food diaries. Just snap and forget.
            </motion.p>
          </div>

          {/* Main content area */}
          <div className="flex-1 max-w-6xl mx-auto w-full px-6 flex items-center">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 w-full items-center">
              {/* Left side - Step navigation */}
              <div className="space-y-2">
                {steps.map((step, index) => {
                  const isActive = activeStep === index;
                  const Icon = step.icon;

                  return (
                    <motion.div
                      key={step.id}
                      className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-500 ${
                        isActive
                          ? 'bg-white dark:bg-neutral-800 shadow-lg'
                          : 'hover:bg-warm-50 dark:hover:bg-neutral-800/50'
                      }`}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0.5,
                        x: isActive ? 0 : -10,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Active indicator bar */}
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-sage-500"
                        initial={false}
                        animate={{
                          height: isActive ? '60%' : '0%',
                          opacity: isActive ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      />

                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? step.color === 'sage' ? 'bg-sage-100 dark:bg-sage-900/30'
                            : step.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30'
                            : step.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/30'
                            : 'bg-warm-100 dark:bg-warm-900/30'
                            : 'bg-warm-100 dark:bg-neutral-700'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isActive
                              ? step.color === 'sage' ? 'text-sage-600 dark:text-sage-400'
                              : step.color === 'blue' ? 'text-blue-600 dark:text-blue-400'
                              : step.color === 'violet' ? 'text-violet-600 dark:text-violet-400'
                              : 'text-warm-600 dark:text-warm-400'
                              : 'text-warm-400 dark:text-neutral-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wide ${
                              isActive ? 'text-sage-600 dark:text-sage-400' : 'text-warm-400 dark:text-neutral-500'
                            }`}>
                              Step {step.id}
                            </span>
                          </div>
                          <h3 className={`text-xl font-bold mb-2 transition-colors ${
                            isActive ? 'text-warm-900 dark:text-neutral-100' : 'text-warm-500 dark:text-neutral-400'
                          }`}>
                            {step.headline}
                          </h3>
                          <AnimatePresence mode="wait">
                            {isActive && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="text-warm-600 dark:text-neutral-400 text-sm leading-relaxed"
                              >
                                {step.description}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right side - Visual showcase */}
              <div className="relative h-[400px] lg:h-[450px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {/* Step 1: Capture */}
                  {activeStep === 0 && (
                    <motion.div
                      key="capture"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {/* Phone frame - matching hero phone exactly */}
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
                          {/* Home Screen - identical to hero phone */}
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

                            {/* Log a Meal Card - animates as if being tapped */}
                            <motion.div
                              className="rounded-2xl p-3 mb-3"
                              style={{ backgroundColor: '#ffffff' }}
                              animate={{
                                scale: mealCaptured ? [1, 0.97, 1] : 1,
                              }}
                              transition={{ duration: 0.15 }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f5f5f5' }}>
                                  <Camera className="w-5 h-5" style={{ color: '#737373' }} strokeWidth={1.5} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold" style={{ color: '#171717' }}>Log a Meal</p>
                                  <p className="text-[9px] truncate" style={{ color: '#9ca3af' }}>Take a photo or choos...</p>
                                </div>
                                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#d4d4d4' }} />
                              </div>
                            </motion.div>

                            {/* Recent Meals */}
                            <p className="text-xs font-bold mb-2" style={{ color: '#171717' }}>Recent Meals</p>
                            <div
                              className="rounded-2xl p-3"
                              style={{ backgroundColor: '#ffffff' }}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f3e8ff' }}>
                                  <span className="text-lg">🍫</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1">
                                    <p className="text-xs font-bold truncate" style={{ color: '#171717' }}>Purdys ...</p>
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
                            </div>

                            {/* Tab Bar */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 pb-5">
                              <div className="rounded-2xl py-2 px-1 flex justify-around shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                                {[
                                  { label: 'Log', active: true },
                                  { label: 'Insights', active: false },
                                  { label: 'Report', active: false },
                                  { label: 'History', active: false },
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
                          </div>

                          {/* iOS-style sheet sliding up from bottom - auto-animates after 1.5 seconds */}
                          <motion.div
                            className="absolute left-0 right-0 bottom-0 rounded-t-[24px] overflow-hidden shadow-2xl"
                            style={{ backgroundColor: '#f5f5f4', height: '85%' }}
                            initial={{ y: '100%' }}
                            animate={{ y: mealCaptured ? '0%' : '100%' }}
                            transition={{
                              type: 'spring',
                              damping: 28,
                              stiffness: 100,
                            }}
                          >
                            {/* Sheet handle */}
                            <div className="flex justify-center pt-2 pb-3">
                              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#d4d4d4' }} />
                            </div>

                            {/* Log Meal header */}
                            <div className="flex items-center justify-between px-4 mb-6">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ffffff' }}>
                                <ChevronLeft className="w-4 h-4" style={{ color: '#525252' }} />
                              </div>
                              <span className="font-semibold text-sm" style={{ color: '#171717' }}>Log Meal</span>
                              <div className="w-8" />
                            </div>

                            {/* Capture content */}
                            <div className="px-4">
                              <div className="text-center mb-6">
                                <h4 className="text-base font-bold mb-1" style={{ color: '#171717' }}>Capture your meal</h4>
                                <p className="text-[10px]" style={{ color: '#9ca3af' }}>We'll remember so you don't have to</p>
                              </div>

                              {/* Options */}
                              <div className="space-y-2">
                                <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#ffffff' }}>
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ecfeff' }}>
                                    <Camera className="w-5 h-5" style={{ color: '#06b6d4' }} strokeWidth={1.5} />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-semibold text-xs" style={{ color: '#171717' }}>Take Photo</p>
                                    <p className="text-[9px]" style={{ color: '#9ca3af' }}>Use your camera</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4" style={{ color: '#d4d4d4' }} />
                                </div>

                                <div className="rounded-xl p-3 flex items-center gap-3" style={{ backgroundColor: '#ffffff' }}>
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#ecfeff' }}>
                                    <ImageIcon className="w-5 h-5" style={{ color: '#06b6d4' }} strokeWidth={1.5} />
                                  </div>
                                  <div className="flex-1 text-left">
                                    <p className="font-semibold text-xs" style={{ color: '#171717' }}>Choose from Gallery</p>
                                    <p className="text-[9px]" style={{ color: '#9ca3af' }}>Select an existing photo</p>
                                  </div>
                                  <ChevronRight className="w-4 h-4" style={{ color: '#d4d4d4' }} />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Home indicator */}
                        <div
                          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full"
                          style={{ backgroundColor: '#525252' }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Forget */}
                  {activeStep === 1 && (
                    <motion.div
                      key="forget"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-warm-100 dark:border-neutral-700">
                        <div className="text-center mb-8">
                          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4 flex items-center justify-center">
                            <BellOff className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="text-xl font-bold text-warm-900 dark:text-neutral-100 mb-2">Peace of mind</h4>
                          <p className="text-warm-500 dark:text-neutral-400 text-sm">Your data builds silently</p>
                        </div>
                        <div className="space-y-3">
                          {[
                            { text: 'Daily reminders', crossed: true },
                            { text: 'Calorie counting', crossed: true },
                            { text: 'Streak pressure', crossed: true },
                            { text: 'Guilt trips', crossed: true },
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              className="flex items-center gap-3 p-3 bg-warm-50 dark:bg-neutral-700 rounded-xl"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                            >
                              <X className="w-5 h-5 text-warm-400 dark:text-neutral-500" />
                              <span className="text-warm-500 dark:text-neutral-400 line-through">{item.text}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Discover */}
                  {activeStep === 2 && (
                    <motion.div
                      key="discover"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-warm-100 dark:border-neutral-700">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                          </div>
                          <div>
                            <h4 className="font-bold text-warm-900 dark:text-neutral-100">Your Insights</h4>
                            <p className="text-xs text-warm-500 dark:text-neutral-400">Last 30 days</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {[
                            { label: 'Plastic bottles', value: 12, max: 20, color: 'bg-blue-500', emoji: '🍶' },
                            { label: 'Processed meat', value: 8, max: 20, color: 'bg-rose-500', emoji: '🥓' },
                            { label: 'Late meals', value: 5, max: 20, color: 'bg-violet-500', emoji: '🌙' },
                            { label: 'Fiber-rich foods', value: 15, max: 20, color: 'bg-green-500', emoji: '🥬' },
                          ].map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 + i * 0.1 }}
                            >
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-warm-600 dark:text-neutral-300 flex items-center gap-2">
                                  <span>{item.emoji}</span>
                                  {item.label}
                                </span>
                                <span className="text-warm-900 dark:text-neutral-100 font-semibold">{item.value}</span>
                              </div>
                              <div className="h-3 bg-warm-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full ${item.color} rounded-full`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(item.value / item.max) * 100}%` }}
                                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Share */}
                  {activeStep === 3 && (
                    <motion.div
                      key="share"
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {/* Phone frame - matching hero phone */}
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
                          <div className="px-3 pt-10 pb-4 h-full overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-3">
                              <motion.div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' }}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                              >
                                <FileText className="w-5 h-5 text-white" strokeWidth={1.5} />
                              </motion.div>
                              <div>
                                <p className="text-xs font-bold" style={{ color: '#171717' }}>Doctor Report</p>
                                <p className="text-[8px]" style={{ color: '#9ca3af' }}>Generate for your provider</p>
                              </div>
                            </div>

                            {/* Time Period Selection */}
                            <p className="text-[9px] font-semibold mb-2" style={{ color: '#525252' }}>Time Period</p>
                            <div className="grid grid-cols-2 gap-1.5 mb-3">
                              {[
                                { label: '1 Month', selected: false },
                                { label: '3 Months', selected: true },
                                { label: '6 Months', selected: false },
                                { label: '1 Year', selected: false },
                              ].map((period, i) => (
                                <motion.div
                                  key={i}
                                  className="p-2 rounded-lg text-center"
                                  style={{
                                    backgroundColor: period.selected ? '#f0fdf4' : '#ffffff',
                                    border: period.selected ? '1.5px solid #22c55e' : '1px solid #e5e5e5'
                                  }}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 + i * 0.05 }}
                                >
                                  <p className="text-[9px] font-semibold" style={{ color: period.selected ? '#16a34a' : '#525252' }}>
                                    {period.label}
                                  </p>
                                  <p className="text-[7px]" style={{ color: period.selected ? '#22c55e' : '#9ca3af' }}>
                                    {period.selected ? '28 meals' : '—'}
                                  </p>
                                </motion.div>
                              ))}
                            </div>

                            {/* Report Preview Card */}
                            <motion.div
                              className="rounded-xl p-3 mb-3"
                              style={{ backgroundColor: '#ffffff' }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[9px] font-semibold" style={{ color: '#171717' }}>Report Preview</p>
                                <span className="px-1.5 py-0.5 text-[7px] font-semibold rounded-full" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                                  Ready
                                </span>
                              </div>
                              <div className="space-y-1.5 mb-2">
                                {['Dietary Patterns', 'Risk Factors', 'Recommendations'].map((section, i) => (
                                  <motion.div
                                    key={i}
                                    className="flex items-center gap-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                  >
                                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                                    <p className="text-[8px]" style={{ color: '#525252' }}>{section}</p>
                                  </motion.div>
                                ))}
                              </div>
                              <div className="flex gap-1">
                                <span className="px-1.5 py-0.5 text-[7px] font-medium rounded-full" style={{ backgroundColor: '#f5f5f5', color: '#525252' }}>
                                  ⚡ AI Powered
                                </span>
                                <span className="px-1.5 py-0.5 text-[7px] font-medium rounded-full" style={{ backgroundColor: '#f5f5f5', color: '#525252' }}>
                                  🩺 Doctor Ready
                                </span>
                              </div>
                            </motion.div>

                            {/* Generate Button */}
                            <motion.div
                              className="rounded-xl p-3 flex items-center justify-center gap-2"
                              style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' }}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                              whileHover={{ scale: 1.02 }}
                            >
                              <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
                              <span className="text-[10px] font-semibold text-white">Download PDF Report</span>
                            </motion.div>
                          </div>
                        </div>

                        {/* Home indicator */}
                        <div
                          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full"
                          style={{ backgroundColor: '#525252' }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// BENTO CARD COMPONENTS
// ============================================

function BentoCard({ children, className = '', hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-warm-100 dark:border-neutral-800 ${className}`}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.1)' } : {}}
      transition={{ duration: 0.3 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cursor-following glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(76, 175, 147, 0.15), transparent 40%)`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      {/* Border glow effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(76, 175, 147, 0.4), transparent 40%)`,
          mask: 'linear-gradient(black, black) content-box, linear-gradient(black, black)',
          maskComposite: 'xor',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      <div className="relative z-10">
        {children}
      </div>
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
      {/* Scroll Progress Indicator */}
      <ScrollProgressBar />

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
        {/* Parallax gradient orbs - move at different scroll speeds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ParallaxOrb
            className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sage-200/40 to-emerald-200/30 dark:from-sage-900/30 dark:to-emerald-900/20 blur-3xl"
            speed={-0.15}
            scale={[1, 1.1, 1]}
            opacity={[0.5, 0.7, 0.5]}
            duration={8}
          />
          <ParallaxOrb
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-200/30 to-sage-200/30 dark:from-blue-900/20 dark:to-sage-900/20 blur-3xl"
            speed={-0.25}
            scale={[1.1, 1, 1.1]}
            opacity={[0.4, 0.6, 0.4]}
            duration={10}
          />
          {/* Additional subtle orb for depth */}
          <ParallaxOrb
            className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-violet-200/20 to-transparent dark:from-violet-900/10 blur-3xl"
            speed={-0.1}
            scale={[1, 1.15, 1]}
            opacity={[0.3, 0.5, 0.3]}
            duration={12}
          />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content - Orchestrated entrance sequence with scroll fade */}
            <ScrollFade fadeStart={100} fadeEnd={400}>
              {/* Hero headline with staggered word animation */}
              <h1 className="text-display text-5xl sm:text-6xl lg:text-7xl text-warm-900 dark:text-neutral-100 mb-6 leading-[1.05]">
                <StaggeredWords text="Prevent disease." baseDelay={0.2} staggerDelay={0.1} />
                <br />
                <StaggeredWords text="React when needed." baseDelay={0.5} staggerDelay={0.1} isGradient />
              </h1>

              {/* Subtitle with orchestrated entrance */}
              <OrchestratedEntrance index={0} baseDelay={0.7}>
                <p className="text-xl text-warm-600 dark:text-neutral-400 mb-10 max-w-xl leading-relaxed">
                  Your silent health companion. Capture meals in seconds, build a dietary record passively, and get
                  <span className="text-warm-900 dark:text-neutral-200 font-semibold"> doctor-ready insights</span> when you actually need them.
                </p>
              </OrchestratedEntrance>

              {/* CTA buttons with orchestrated entrance */}
              <OrchestratedEntrance index={1} baseDelay={0.7} className="flex flex-wrap gap-4 mb-12">
                <MagneticWrapper strength={0.2}>
                  <GlowButton href={user ? "/app" : "/login"}>
                    {user ? "Open Dashboard" : "Get started free"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </GlowButton>
                </MagneticWrapper>
                <MagneticWrapper strength={0.15}>
                  <a
                    href="#how-it-works"
                    className="group relative px-8 py-4 bg-white dark:bg-neutral-800 border-2 border-warm-200 dark:border-neutral-700 text-warm-700 dark:text-neutral-200 rounded-2xl font-medium text-lg hover:border-sage-300 dark:hover:border-sage-700 hover:bg-warm-50 dark:hover:bg-neutral-700 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                  >
                    {/* Subtle shimmer on hover */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-sage-100/50 to-transparent" />
                    <Play className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">See how it works</span>
                  </a>
                </MagneticWrapper>
              </OrchestratedEntrance>

              {/* Trust indicators with staggered entrance */}
              <div className="flex items-center gap-8 text-warm-500 dark:text-neutral-400">
                {[
                  { icon: Check, text: 'Free to use' },
                  { icon: Shield, text: 'Privacy first' },
                  { icon: Zap, text: '2-second capture' },
                ].map((item, i) => (
                  <TrustIndicator key={i} icon={item.icon} text={item.text} index={i} />
                ))}
              </div>
            </ScrollFade>

            {/* Right - Interactive Phone */}
            <OrchestratedEntrance index={2} baseDelay={0.5} className="flex justify-center lg:justify-end">
              <InteractivePhone activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
            </OrchestratedEntrance>
          </div>
        </div>
        
        {/* Scroll indicator - fades as user scrolls */}
        <ScrollFade fadeStart={50} fadeEnd={200} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-warm-400 dark:text-neutral-500" />
          </motion.div>
        </ScrollFade>
      </section>

      {/* How It Works - Sticky Scroll Section */}
      <StickyScrollSection />

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
            <h2 className="text-display text-4xl md:text-5xl text-warm-900 dark:text-white mb-10">
              Start building your health history
            </h2>

            <MagneticWrapper className="inline-block">
              <Link
                href={user ? "/app" : "/login"}
                className="group inline-flex items-center gap-3 px-10 py-5 bg-sage-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-sage-600/25 hover:bg-sage-700 transition-all"
              >
                {user ? "Open Dashboard" : "Sign up"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticWrapper>
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
