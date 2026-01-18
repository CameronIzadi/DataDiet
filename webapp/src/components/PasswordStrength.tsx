'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  bgColor: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo((): StrengthResult => {
    if (!password) {
      return { score: 0, label: '', color: '', bgColor: 'bg-neutral-200 dark:bg-neutral-700' };
    }

    let score = 0;

    // Length checks
    if (password.length >= 6) score++;
    if (password.length >= 12) score++;

    // Character type checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Normalize to 0-5 scale
    const normalizedScore = Math.min(5, Math.floor((score / 6) * 5));

    if (normalizedScore <= 1) {
      return { score: normalizedScore, label: 'Weak', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-500' };
    }
    if (normalizedScore <= 2) {
      return { score: normalizedScore, label: 'Fair', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500' };
    }
    if (normalizedScore <= 3) {
      return { score: normalizedScore, label: 'Good', color: 'text-amber-500 dark:text-amber-400', bgColor: 'bg-amber-400' };
    }
    if (normalizedScore <= 4) {
      return { score: normalizedScore, label: 'Strong', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500' };
    }
    return { score: normalizedScore, label: 'Very Strong', color: 'text-emerald-700 dark:text-emerald-400', bgColor: 'bg-emerald-600' };
  }, [password]);

  if (!password) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-2"
      >
        {/* Progress bar */}
        <div className="flex gap-1 mb-1.5">
          {[1, 2, 3, 4, 5].map((level) => (
            <motion.div
              key={level}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                level <= strength.score ? strength.bgColor : 'bg-neutral-200 dark:bg-neutral-700'
              }`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: level * 0.05 }}
            />
          ))}
        </div>

        {/* Label */}
        <div className="flex items-center justify-between">
          <motion.span
            key={strength.label}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-medium ${strength.color}`}
          >
            {strength.label}
          </motion.span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">
            {password.length < 6 ? `${6 - password.length} more chars needed` : ''}
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
