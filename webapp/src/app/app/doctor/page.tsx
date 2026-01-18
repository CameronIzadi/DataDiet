'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  GraduationCap,
  Building2,
  MapPin,
  Clock,
  Shield,
  Mail,
  MessageCircle,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Award,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DoctorProfile, Connection } from '@/types';
import { getAssignedDoctor } from '@/services/messaging';
import { getUserRole } from '@/services/auth';
import Link from 'next/link';
import { format } from 'date-fns';

export default function YourDoctorPage() {
  const { user } = useApp();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'user' | 'doctor' | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      const role = await getUserRole(user.uid);
      setUserRole(role);

      if (role === 'doctor') {
        setIsLoading(false);
        return;
      }

      const result = await getAssignedDoctor(user.uid);
      if (result) {
        setDoctor(result.doctor);
        setConnection(result.connection);
      }
      setIsLoading(false);
    }

    loadData();
  }, [user]);

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-900/40 dark:to-sage-800/40 flex items-center justify-center">
            <Stethoscope className="w-10 h-10 text-sage-600 dark:text-sage-400" />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-3">
            Your Health Advisor
          </h2>
          <p className="text-warm-500 dark:text-neutral-400 mb-6">
            Sign in to view your assigned healthcare professional.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-sage-600 dark:text-sage-400 animate-spin" />
          </div>
          <p className="text-warm-500 dark:text-neutral-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Doctor viewing this page
  if (userRole === 'doctor') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <Stethoscope className="w-10 h-10 text-sage-600 dark:text-sage-400" />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-3">
            You're a Healthcare Provider
          </h2>
          <p className="text-warm-500 dark:text-neutral-400 mb-6">
            This page is for patients to view their assigned doctor. Go to Messages to see your patients.
          </p>
          <Link
            href="/app/messages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            View Patients
          </Link>
        </div>
      </div>
    );
  }

  // No doctor assigned yet
  if (!doctor || !connection) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-3">
            No Advisor Assigned Yet
          </h2>
          <p className="text-warm-500 dark:text-neutral-400 mb-6">
            Go to Messages to get paired with a healthcare professional.
          </p>
          <Link
            href="/app/messages"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Get Paired
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      {/* Back link */}
      <Link
        href="/app/messages"
        className="inline-flex items-center gap-2 text-warm-500 dark:text-neutral-400 hover:text-warm-700 dark:hover:text-neutral-200 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Messages
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-neutral-900 rounded-3xl border border-warm-100 dark:border-neutral-800 shadow-sm overflow-hidden"
      >
        {/* Header with gradient */}
        <div className="h-32 bg-gradient-to-br from-sage-500 to-sage-700 relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
            <CheckCircle className="w-4 h-4" />
            Verified Provider
          </div>
        </div>

        {/* Profile content */}
        <div className="px-6 md:px-8 pb-8 -mt-16 relative">
          {/* Avatar */}
          <div className="flex items-end gap-4 mb-6">
            {doctor.photoURL ? (
              <img
                src={doctor.photoURL}
                alt={doctor.displayName}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-900/40 dark:to-sage-800/40 border-4 border-white dark:border-neutral-900 shadow-lg flex items-center justify-center">
                <Stethoscope className="w-12 h-12 text-sage-600 dark:text-sage-400" />
              </div>
            )}
            <div className="pb-2">
              <p className="text-sm text-sage-600 dark:text-sage-400 font-medium">
                Your Health Advisor
              </p>
            </div>
          </div>

          {/* Name and specialty */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-warm-900 dark:text-white mb-1">
              {doctor.displayName}
            </h1>
            <p className="text-lg text-sage-600 dark:text-sage-400 font-medium">
              {doctor.specialty}
            </p>
            {doctor.bio && (
              <p className="mt-3 text-warm-600 dark:text-neutral-300">
                {doctor.bio}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-sage-50 dark:bg-sage-900/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-sage-700 dark:text-sage-400">
                {doctor.yearsOfExperience}
              </p>
              <p className="text-sm text-warm-500 dark:text-neutral-400">Experience</p>
            </div>
            <div className="bg-sage-50 dark:bg-sage-900/20 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-sage-700 dark:text-sage-400">
                {doctor.licenseState}
              </p>
              <p className="text-sm text-warm-500 dark:text-neutral-400">Licensed In</p>
            </div>
            <div className="bg-sage-50 dark:bg-sage-900/20 rounded-2xl p-4 text-center col-span-2 md:col-span-1">
              <p className="text-2xl font-bold text-sage-700 dark:text-sage-400">
                {format(connection.assignedAt, 'MMM yyyy')}
              </p>
              <p className="text-sm text-warm-500 dark:text-neutral-400">Connected Since</p>
            </div>
          </div>

          {/* Credentials */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-warm-900 dark:text-white mb-4">
              Credentials & Background
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                </div>
                <div>
                  <p className="text-sm text-warm-500 dark:text-neutral-400">Education</p>
                  <p className="font-medium text-warm-900 dark:text-white">
                    {doctor.medicalSchool}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                </div>
                <div>
                  <p className="text-sm text-warm-500 dark:text-neutral-400">Practice</p>
                  <p className="font-medium text-warm-900 dark:text-white">
                    {doctor.practiceName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                </div>
                <div>
                  <p className="text-sm text-warm-500 dark:text-neutral-400">Location</p>
                  <p className="font-medium text-warm-900 dark:text-white">
                    {doctor.practiceAddress}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                </div>
                <div>
                  <p className="text-sm text-warm-500 dark:text-neutral-400">License</p>
                  <p className="font-medium text-warm-900 dark:text-white">
                    {doctor.licenseNumber} ({doctor.licenseState})
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-sage-600 dark:text-sage-400" />
                </div>
                <div>
                  <p className="text-sm text-warm-500 dark:text-neutral-400">NPI Number</p>
                  <p className="font-medium text-warm-900 dark:text-white">
                    {doctor.npiNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app/messages"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-sage-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Send Message
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
