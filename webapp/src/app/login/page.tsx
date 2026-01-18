'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  User,
  Stethoscope,
  Building2,
  GraduationCap,
  MapPin,
  Hash,
  Briefcase,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  registerDoctor,
  resetPassword,
  onAuthChange,
  isFirebaseConfigured,
  DoctorRegistrationData
} from '@/services/auth';
import { PasswordStrength } from '@/components/PasswordStrength';
import { AutocompleteInput } from '@/components/AutocompleteInput';
import { MEDICAL_SCHOOLS, HOSPITAL_SYSTEMS } from '@/data/medicalData';

type AuthMode = 'login' | 'signup' | 'reset' | 'role-selection' | 'doctor-signup';

const MEDICAL_SPECIALTIES = [
  'Allergy and Immunology',
  'Anesthesiology',
  'Cardiology',
  'Dermatology',
  'Emergency Medicine',
  'Endocrinology',
  'Family Medicine',
  'Gastroenterology',
  'General Surgery',
  'Geriatrics',
  'Hematology',
  'Infectious Disease',
  'Internal Medicine',
  'Nephrology',
  'Neurology',
  'Nutrition',
  'Obstetrics and Gynecology',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Otolaryngology (ENT)',
  'Pathology',
  'Pediatrics',
  'Physical Medicine',
  'Plastic Surgery',
  'Psychiatry',
  'Pulmonology',
  'Radiology',
  'Rheumatology',
  'Sports Medicine',
  'Urology',
  'Other',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Doctor registration step (1: credentials, 2: professional info, 3: practice info)
  const [doctorStep, setDoctorStep] = useState(1);
  const [doctorData, setDoctorData] = useState<DoctorRegistrationData>({
    npiNumber: '',
    licenseNumber: '',
    licenseState: '',
    specialty: '',
    practiceName: '',
    practiceAddress: '',
    yearsOfExperience: '',
    medicalSchool: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        router.push('/app');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Please add your credentials to .env.local');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Please add your credentials to .env.local');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        router.push('/app');
      } else if (mode === 'signup') {
        await registerWithEmail(email, password, name);
        router.push('/app');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      setError('Firebase is not configured. Please add your credentials to .env.local');
      return;
    }

    // Validate all fields
    if (!doctorData.npiNumber || !doctorData.licenseNumber || !doctorData.licenseState ||
        !doctorData.specialty || !doctorData.practiceName || !doctorData.practiceAddress ||
        !doctorData.yearsOfExperience || !doctorData.medicalSchool) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate NPI format (10 digits)
    if (!/^\d{10}$/.test(doctorData.npiNumber)) {
      setError('NPI number must be exactly 10 digits');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await registerDoctor(email, password, name, doctorData);
      setSuccess('Your account is pending verification. You will be notified once approved.');
      router.push('/app');
    } catch (err: any) {
      setError(err.message || 'Failed to create doctor account');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    if (newMode === 'doctor-signup') {
      setDoctorStep(1);
    }
  };

  const handleRoleSelection = (role: 'user' | 'doctor') => {
    if (role === 'user') {
      switchMode('signup');
    } else {
      switchMode('doctor-signup');
    }
  };

  const nextDoctorStep = () => {
    setError(null);

    // Validate current step
    if (doctorStep === 1) {
      if (!name || !email || !password) {
        setError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    } else if (doctorStep === 2) {
      if (!doctorData.npiNumber || !doctorData.licenseNumber || !doctorData.licenseState || !doctorData.specialty) {
        setError('Please fill in all fields');
        return;
      }
      if (!/^\d{10}$/.test(doctorData.npiNumber)) {
        setError('NPI number must be exactly 10 digits');
        return;
      }
    }

    setDoctorStep(prev => Math.min(prev + 1, 3));
  };

  const prevDoctorStep = () => {
    setError(null);
    setDoctorStep(prev => Math.max(prev - 1, 1));
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome back';
      case 'signup': return 'Create your account';
      case 'reset': return 'Reset your password';
      case 'role-selection': return 'Join DataDiet';
      case 'doctor-signup':
        if (doctorStep === 1) return 'Create your account';
        if (doctorStep === 2) return 'Professional credentials';
        return 'Practice information';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to access your dietary insights';
      case 'signup': return 'Start building your dietary history today';
      case 'reset': return "We'll send you a link to reset your password";
      case 'role-selection': return 'Choose how you want to use DataDiet';
      case 'doctor-signup':
        if (doctorStep === 1) return 'Enter your account details';
        if (doctorStep === 2) return 'Verify your medical credentials';
        return 'Tell us about your practice';
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex transition-colors duration-300 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-sage-200/30 to-sage-300/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-warm-200/30 to-warm-300/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-sage-100/20 to-emerald-100/10 blur-2xl" />
      </div>

      {/* Left side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 xl:px-32 relative z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            {mode === 'role-selection' || mode === 'login' ? (
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            ) : (
              <button
                onClick={() => {
                  if (mode === 'doctor-signup' && doctorStep > 1) {
                    prevDoctorStep();
                  } else if (mode === 'doctor-signup' || mode === 'signup') {
                    switchMode('role-selection');
                  } else {
                    switchMode('login');
                  }
                }}
                className="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                <span className="text-white font-bold text-xl">DB</span>
              </div>
              <span className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">DataDiet</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${mode}-${doctorStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-display text-3xl md:text-4xl text-neutral-900 dark:text-neutral-100 mb-3">
                  {getTitle()}
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-lg">
                  {getSubtitle()}
                </p>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Role Selection */}
          <AnimatePresence mode="wait">
            {mode === 'role-selection' && (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => handleRoleSelection('user')}
                  className="w-full p-6 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl hover:border-sage-500 dark:hover:border-sage-600 hover:bg-sage-50 dark:hover:bg-sage-950/20 transition-all group text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center group-hover:bg-sage-200 dark:group-hover:bg-sage-800/40 transition-colors">
                      <User className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        I'm a User
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        Track your diet, log meals, and get personalized insights about your nutrition
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors mt-1" />
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('doctor')}
                  className="w-full p-6 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl hover:border-sage-500 dark:hover:border-sage-600 hover:bg-sage-50 dark:hover:bg-sage-950/20 transition-all group text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center group-hover:bg-sage-200 dark:group-hover:bg-sage-800/40 transition-colors">
                      <Stethoscope className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        I'm a Doctor
                      </h3>
                      <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                        Access patient dietary data, provide recommendations, and manage patient care
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-sage-600 dark:group-hover:text-sage-400 transition-colors mt-1" />
                  </div>
                </button>

                <div className="pt-4 text-center">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Already have an account?{' '}
                    <button
                      onClick={() => switchMode('login')}
                      className="text-neutral-800 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Doctor Signup Steps */}
            {mode === 'doctor-signup' && (
              <motion.div
                key={`doctor-step-${doctorStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Progress indicator */}
                <div className="flex items-center gap-2 mb-8">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        step <= doctorStep
                          ? 'bg-sage-500'
                          : 'bg-neutral-200 dark:bg-neutral-700'
                      }`}
                    />
                  ))}
                </div>

                <form onSubmit={doctorStep === 3 ? handleDoctorSignup : (e) => { e.preventDefault(); nextDoctorStep(); }} className="space-y-5">
                  {/* Step 1: Account Details */}
                  {doctorStep === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Full name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Dr. John Doe"
                          className="w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Professional email
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="doctor@hospital.com"
                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Password
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                            required
                            minLength={6}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <PasswordStrength password={password} />
                      </div>
                    </>
                  )}

                  {/* Step 2: Professional Credentials */}
                  {doctorStep === 2 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          NPI Number
                        </label>
                        <div className="relative group">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                          <input
                            type="text"
                            value={doctorData.npiNumber}
                            onChange={(e) => setDoctorData({ ...doctorData, npiNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            placeholder="10-digit NPI number"
                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                            required
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                          Your National Provider Identifier for verification
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            License Number
                          </label>
                          <input
                            type="text"
                            value={doctorData.licenseNumber}
                            onChange={(e) => setDoctorData({ ...doctorData, licenseNumber: e.target.value })}
                            placeholder="License #"
                            className="w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            State
                          </label>
                          <select
                            value={doctorData.licenseState}
                            onChange={(e) => setDoctorData({ ...doctorData, licenseState: e.target.value })}
                            className="w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select state</option>
                            {US_STATES.map((state) => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Medical Specialty
                        </label>
                        <div className="relative group">
                          <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                          <select
                            value={doctorData.specialty}
                            onChange={(e) => setDoctorData({ ...doctorData, specialty: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select specialty</option>
                            {MEDICAL_SPECIALTIES.map((specialty) => (
                              <option key={specialty} value={specialty}>{specialty}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 3: Practice Information */}
                  {doctorStep === 3 && (
                    <>
                      <AutocompleteInput
                        label="Practice / Hospital Name"
                        value={doctorData.practiceName}
                        onChange={(value) => setDoctorData({ ...doctorData, practiceName: value })}
                        options={HOSPITAL_SYSTEMS}
                        placeholder="Search or enter practice name..."
                        icon={<Building2 className="w-5 h-5" />}
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Practice Address
                        </label>
                        <div className="relative group">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                          <input
                            type="text"
                            value={doctorData.practiceAddress}
                            onChange={(e) => setDoctorData({ ...doctorData, practiceAddress: e.target.value })}
                            placeholder="Full address (e.g., 123 Medical Center Dr, City, State)"
                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                            required
                          />
                        </div>
                      </div>

                      <AutocompleteInput
                        label="Medical School"
                        value={doctorData.medicalSchool}
                        onChange={(value) => setDoctorData({ ...doctorData, medicalSchool: value })}
                        options={MEDICAL_SCHOOLS}
                        placeholder="Search for your medical school..."
                        icon={<GraduationCap className="w-5 h-5" />}
                        required
                      />

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Years of Experience
                        </label>
                        <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                          <select
                            value={doctorData.yearsOfExperience}
                            onChange={(e) => setDoctorData({ ...doctorData, yearsOfExperience: e.target.value })}
                            className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Select experience</option>
                            <option value="0-2">0-2 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="6-10">6-10 years</option>
                            <option value="11-20">11-20 years</option>
                            <option value="20+">20+ years</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-4 bg-neutral-900 text-white rounded-xl font-semibold text-lg hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : doctorStep < 3 ? (
                      <>
                        Continue
                        <ChevronRight className="w-5 h-5" />
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </motion.button>
                </form>

                {/* Info note */}
                {doctorStep === 3 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center text-sm text-neutral-400 dark:text-neutral-500"
                  >
                    Your credentials will be verified within 24-48 hours. You'll receive an email once approved.
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Regular Login/Signup Forms */}
            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Google Sign In */}
                {mode !== 'reset' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 font-medium">or continue with email</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Email Form */}
                <motion.form
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onSubmit={handleEmailAuth}
                  className="space-y-5"
                >
                  {/* Name field (signup only) */}
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Full name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full px-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                          required={mode === 'signup'}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Email address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Password field (not for reset) */}
                  <AnimatePresence>
                    {mode !== 'reset' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                          Password
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-colors group-focus-within:text-sage-600 dark:group-focus-within:text-sage-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-4 bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-900 focus:border-sage-500 dark:focus:border-sage-600 focus:ring-4 focus:ring-sage-100 dark:focus:ring-sage-900/30 transition-all outline-none"
                            required
                            minLength={6}
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {mode === 'signup' && <PasswordStrength password={password} />}
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('reset')}
                            className="mt-2 text-sm text-neutral-800 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-medium"
                          >
                            Forgot password?
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success message */}
                  <AnimatePresence>
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-3 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-700 dark:text-neutral-300"
                      >
                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{success}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-4 bg-neutral-900 text-white rounded-xl font-semibold text-lg hover:bg-neutral-800 transition-colors shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {mode === 'login' && 'Signing in...'}
                        {mode === 'signup' && 'Creating account...'}
                        {mode === 'reset' && 'Sending...'}
                      </>
                    ) : (
                      <>
                        {mode === 'login' && 'Sign in'}
                        {mode === 'signup' && 'Create account'}
                        {mode === 'reset' && 'Send reset link'}
                      </>
                    )}
                  </motion.button>
                </motion.form>

                {/* Mode switcher */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 text-center"
                >
                  {mode === 'login' && (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Don&apos;t have an account?{' '}
                      <button
                        onClick={() => switchMode('role-selection')}
                        className="text-neutral-800 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold"
                      >
                        Sign up
                      </button>
                    </p>
                  )}
                  {mode === 'signup' && (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Already have an account?{' '}
                      <button
                        onClick={() => switchMode('login')}
                        className="text-neutral-800 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                  {mode === 'reset' && (
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Remember your password?{' '}
                      <button
                        onClick={() => switchMode('login')}
                        className="text-neutral-800 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-semibold"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </motion.div>

                {/* Terms */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center text-sm text-neutral-400 dark:text-neutral-500"
                >
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline">Privacy Policy</Link>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
