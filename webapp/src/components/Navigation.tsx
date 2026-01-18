'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, FileText, Droplets, LogOut, User, Sun, Moon } from 'lucide-react';
import { onAuthChange, signOutUser } from '@/services/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { href: '/app', label: 'Home', icon: Home },
  { href: '/app/insights', label: 'Insights', icon: BarChart3 },
  { href: '/app/bloodwork', label: 'Blood Work', icon: Droplets },
  { href: '/app/report', label: 'Report', icon: FileText },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
    });
    return () => unsubscribe();
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
      setShowDropdown(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block sticky top-0 z-50">
        <nav className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-warm-200/50 dark:border-neutral-800/50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-sage-500 to-sage-700 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">DB</span>
                  </div>
                  <span className="font-semibold text-warm-900 dark:text-neutral-100">DataDiet</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                        ${isActive
                          ? 'bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-400'
                          : 'text-warm-500 dark:text-neutral-400 hover:bg-warm-100 dark:hover:bg-neutral-800 hover:text-warm-700 dark:hover:text-neutral-200'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  );
                })}
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-lg bg-warm-100 dark:bg-neutral-800 flex items-center justify-center text-warm-600 dark:text-neutral-300 hover:bg-warm-200 dark:hover:bg-neutral-700 transition-colors"
                  aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>

                {/* Sign Out Button - Always Visible */}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-warm-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>

                {/* User Avatar with Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-warm-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-warm-200 dark:bg-neutral-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-warm-500 dark:text-neutral-400" />
                      </div>
                    )}
                  </button>

                <AnimatePresence>
                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-warm-100 dark:border-neutral-800 overflow-hidden z-50"
                      >
                        {user && (
                          <div className="px-4 py-4 bg-gradient-to-br from-sage-50 to-white dark:from-sage-950/30 dark:to-neutral-900 border-b border-warm-100 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                              {user.photoURL ? (
                                <img
                                  src={user.photoURL}
                                  alt={user.displayName || 'User'}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-sage-200 dark:bg-sage-900/30 flex items-center justify-center">
                                  <User className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-warm-900 dark:text-neutral-100 truncate">{user.displayName || 'User'}</p>
                                <p className="text-sm text-warm-500 dark:text-neutral-400 truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="p-2">
                          <Link
                            href="/app"
                            onClick={() => setShowDropdown(false)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-warm-700 dark:text-neutral-300 hover:bg-warm-50 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                          >
                            <Home className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>

                          <hr className="my-2 border-warm-100 dark:border-neutral-800" />

                          <button
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-50"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {/* Subtle gradient fade below nav */}
        <div
          className="h-4 pointer-events-none -mt-px dark:hidden"
          style={{
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
          }}
        />
        <div
          className="h-4 pointer-events-none -mt-px hidden dark:block"
          style={{
            background: 'linear-gradient(to bottom, rgba(10, 10, 10, 0.8) 0%, rgba(10, 10, 10, 0) 100%)',
          }}
        />
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-warm-200/50 dark:border-neutral-800/50 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all
                  ${isActive
                    ? 'text-sage-600 dark:text-sage-400'
                    : 'text-warm-400 dark:text-neutral-500 hover:text-warm-600 dark:hover:text-neutral-300'
                  }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}

          {/* Profile/Sign Out button for mobile */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all text-warm-400 dark:text-neutral-500 hover:text-warm-600 dark:hover:text-neutral-300"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-t-3xl shadow-2xl z-50 p-6 pb-10"
              >
                {/* Handle bar */}
                <div className="w-12 h-1.5 bg-warm-200 dark:bg-neutral-700 rounded-full mx-auto mb-6" />

                {user && (
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-warm-100 dark:border-neutral-800">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
                        <User className="w-7 h-7 text-sage-600 dark:text-sage-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-warm-900 dark:text-neutral-100 text-lg truncate">{user.displayName || 'User'}</p>
                      <p className="text-warm-500 dark:text-neutral-400 truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Link
                    href="/app/report"
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 text-warm-700 dark:text-neutral-300 hover:bg-warm-50 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    <span className="font-medium">Doctor Report</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full flex items-center gap-4 px-4 py-3.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
