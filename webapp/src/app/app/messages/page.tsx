'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Loader2,
  User,
  Stethoscope,
  Search,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  CheckCheck,
  Sparkles,
  GraduationCap,
  Building2,
  Clock,
  Shield,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Conversation, Message, DoctorProfile, Connection } from '@/types';
import {
  getAssignedDoctor,
  autoPairWithDoctor,
  sendWelcomeMessage,
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
} from '@/services/messaging';
import { getUserRole } from '@/services/auth';
import { format, isToday, isYesterday } from 'date-fns';
import Link from 'next/link';

// Format timestamp
function formatMessageTime(date: Date): string {
  if (isToday(date)) return format(date, 'h:mm a');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

// Pairing states
type PairingState = 'checking' | 'pairing' | 'intro' | 'chat' | 'no-doctors' | 'error';

export default function MessagesPage() {
  const { user } = useApp();
  const [userRole, setUserRole] = useState<'user' | 'doctor' | null>(null);
  const [pairingState, setPairingState] = useState<PairingState>('checking');

  // Patient state
  const [assignedDoctor, setAssignedDoctor] = useState<DoctorProfile | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // Doctor state (multiple patients)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check user role
  useEffect(() => {
    async function checkRole() {
      if (user) {
        const role = await getUserRole(user.uid);
        setUserRole(role);
      }
    }
    checkRole();
  }, [user]);

  // Patient flow: Auto-pair with doctor
  useEffect(() => {
    if (!user || userRole === 'doctor' || userRole === null) return;

    // Capture user data for async operations
    const userId = user.uid;
    const userName = user.displayName || 'User';
    const userEmail = user.email || '';
    const userPhoto = user.photoURL || undefined;

    async function initPatient() {
      setPairingState('checking');

      // Check for existing assignment
      const existing = await getAssignedDoctor(userId);

      if (existing) {
        setAssignedDoctor(existing.doctor);
        setConnection(existing.connection);
        setConversation(existing.conversation);
        setPairingState('chat');
        return;
      }

      // No existing doctor - start pairing
      setPairingState('pairing');

      // Small delay for UX
      await new Promise((r) => setTimeout(r, 2000));

      const result = await autoPairWithDoctor(userId, userName, userEmail, userPhoto);

      if (result) {
        setAssignedDoctor(result.doctor);
        setConnection(result.connection);
        setConversation(result.conversation);
        setPairingState('intro');

        // Send welcome message from doctor
        await sendWelcomeMessage(
          result.conversation.id,
          result.doctor.uid,
          result.doctor.displayName,
          userName
        );
      } else {
        setPairingState('no-doctors');
      }
    }

    initPatient();
  }, [user, userRole]);

  // Doctor flow: Subscribe to patient conversations
  useEffect(() => {
    if (!user || userRole !== 'doctor') return;

    setPairingState('chat');
    const unsubscribe = subscribeToConversations(user.uid, (convos) => {
      setConversations(convos);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    const activeConvo = userRole === 'doctor' ? selectedConversation : conversation;
    if (!activeConvo || !user) return;

    const unsubscribe = subscribeToMessages(activeConvo.id, (msgs) => {
      setMessages(msgs);
      markMessagesAsRead(activeConvo.id, user.uid);
    });

    return () => unsubscribe();
  }, [conversation, selectedConversation, user, userRole]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeConvo = userRole === 'doctor' ? selectedConversation : conversation;
    if (!activeConvo || !user || !newMessage.trim()) return;

    setIsSending(true);
    const role = user.uid === activeConvo.doctorId ? 'doctor' : 'patient';

    await sendMessage(
      activeConvo.id,
      user.uid,
      user.displayName || 'User',
      role,
      newMessage.trim()
    );

    setNewMessage('');
    setIsSending(false);
  };

  // Start chatting (after intro)
  const handleStartChat = () => {
    setPairingState('chat');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Not signed in
  if (!user) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-900/40 dark:to-sage-800/40 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-sage-600 dark:text-sage-400" />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-3">
            Your Health Advisor
          </h2>
          <p className="text-warm-500 dark:text-neutral-400 mb-6">
            Sign in to get paired with a healthcare professional for personalized guidance.
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

  // Checking/Loading state
  if (pairingState === 'checking' || userRole === null) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-sage-600 dark:text-sage-400 animate-spin" />
          </div>
          <p className="text-warm-500 dark:text-neutral-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Pairing animation - Dynamic matching visualization
  if (pairingState === 'pairing') {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md mx-auto px-6 relative"
        >
          {/* Background gradient orbs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-sage-200/30 to-teal-200/20 dark:from-sage-900/20 dark:to-teal-900/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Main animation container */}
          <div className="relative w-64 h-64 mx-auto mb-10">
            {/* Outer expanding pulse rings */}
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`pulse-${i}`}
                className="absolute inset-0 rounded-full border-2 border-sage-400/30 dark:border-sage-500/20"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.5], opacity: [0.6, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Middle ring - dashed rotating */}
            <motion.div
              className="absolute inset-8 rounded-full border-2 border-dashed border-sage-300 dark:border-sage-700"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            {/* Inner ring - solid */}
            <div className="absolute inset-16 rounded-full border border-sage-200 dark:border-sage-800" />

            {/* Orbiting particles */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={`orbit-${i}`}
                className="absolute top-1/2 left-1/2"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 6 + i * 0.5,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: i * 0.3,
                }}
                style={{ transformOrigin: '0 0' }}
              >
                <motion.div
                  className={`w-3 h-3 rounded-full ${
                    i % 2 === 0
                      ? 'bg-gradient-to-br from-sage-400 to-sage-600'
                      : 'bg-gradient-to-br from-teal-400 to-teal-600'
                  }`}
                  style={{
                    transform: `translate(${70 + i * 8}px, -6px)`,
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              </motion.div>
            ))}

            {/* Center core - layered glass effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Outer glow */}
              <motion.div
                className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-sage-400/20 to-teal-400/20 blur-xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Glass container */}
              <motion.div
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-white/80 to-white/40 dark:from-neutral-800/80 dark:to-neutral-900/40 backdrop-blur-xl border border-white/50 dark:border-neutral-700/50 shadow-2xl"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {/* Inner gradient */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-sage-500 to-teal-600 shadow-lg shadow-sage-500/30 flex items-center justify-center">
                  {/* Icon container */}
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Stethoscope className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>

            {/* Floating connection dots */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const radius = 110;
              return (
                <motion.div
                  key={`dot-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-sage-400/60 dark:bg-sage-500/40"
                  style={{
                    left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                    top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{
                    scale: [0.5, 1, 0.5],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              );
            })}
          </div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-3">
              Finding Your Health Advisor
            </h2>
            <p className="text-warm-500 dark:text-neutral-400 mb-8">
              We're matching you with a qualified healthcare professional...
            </p>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={`progress-${i}`}
                  className="w-2 h-2 rounded-full bg-sage-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // No doctors available
  if (pairingState === 'no-doctors') {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-3">
            All Advisors Are Busy
          </h2>
          <p className="text-warm-500 dark:text-neutral-400 mb-6">
            Our health advisors are currently at capacity. We'll notify you as soon as one becomes available.
          </p>
          <button className="inline-flex items-center justify-center px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors">
            Notify Me When Available
          </button>
        </div>
      </div>
    );
  }

  // Meet your doctor intro (patients only)
  if (pairingState === 'intro' && assignedDoctor) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-warm-100 dark:border-neutral-800 shadow-xl overflow-hidden">
            {/* Header gradient */}
            <div className="h-24 bg-gradient-to-br from-sage-500 to-sage-700 relative">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            </div>

            {/* Doctor info */}
            <div className="px-8 pb-8 -mt-12 relative">
              {/* Avatar */}
              <div className="mb-6">
                {assignedDoctor.photoURL ? (
                  <img
                    src={assignedDoctor.photoURL}
                    alt={assignedDoctor.displayName}
                    className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-900/40 dark:to-sage-800/40 border-4 border-white dark:border-neutral-900 shadow-lg flex items-center justify-center">
                    <Stethoscope className="w-10 h-10 text-sage-600 dark:text-sage-400" />
                  </div>
                )}
              </div>

              {/* Name and title */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-1">
                  Meet Your Health Advisor
                </h2>
                <h3 className="text-xl font-semibold text-sage-600 dark:text-sage-400">
                  {assignedDoctor.displayName}
                </h3>
                <p className="text-warm-500 dark:text-neutral-400">
                  {assignedDoctor.specialty}
                </p>
              </div>

              {/* Credentials */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-warm-600 dark:text-neutral-300">
                  <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                  </div>
                  <span className="text-sm">{assignedDoctor.medicalSchool}</span>
                </div>
                <div className="flex items-center gap-3 text-warm-600 dark:text-neutral-300">
                  <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                  </div>
                  <span className="text-sm">{assignedDoctor.practiceName}</span>
                </div>
                <div className="flex items-center gap-3 text-warm-600 dark:text-neutral-300">
                  <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                  </div>
                  <span className="text-sm">{assignedDoctor.yearsOfExperience} of experience</span>
                </div>
                <div className="flex items-center gap-3 text-warm-600 dark:text-neutral-300">
                  <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-900/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                  </div>
                  <span className="text-sm">Licensed in {assignedDoctor.licenseState}</span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleStartChat}
                className="w-full py-4 bg-sage-600 hover:bg-sage-700 text-white font-semibold rounded-2xl transition-colors shadow-lg shadow-sage-500/20 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Start Conversation
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main chat interface
  const activeConversation = userRole === 'doctor' ? selectedConversation : conversation;
  const otherParty = activeConversation
    ? userRole === 'doctor'
      ? { name: activeConversation.patientName, photo: activeConversation.patientPhotoURL, role: 'Patient' }
      : { name: activeConversation.doctorName, photo: activeConversation.doctorPhotoURL, role: activeConversation.doctorSpecialty || 'Doctor' }
    : null;

  // For patients: direct chat view
  if (userRole !== 'doctor' && assignedDoctor && conversation) {
    return (
      <div className="h-[calc(100vh-120px)] max-w-4xl mx-auto px-4 md:px-6 py-4">
        <div className="h-full bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 shadow-sm flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-warm-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/app/doctor"
                className="relative"
              >
                {assignedDoctor.photoURL ? (
                  <img
                    src={assignedDoctor.photoURL}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-900/40 dark:to-sage-800/40 flex items-center justify-center">
                    <Stethoscope className="w-5 h-5 text-sage-600 dark:text-sage-400" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full" />
              </Link>
              <div>
                <h2 className="font-semibold text-warm-900 dark:text-white">
                  {assignedDoctor.displayName}
                </h2>
                <p className="text-xs text-sage-600 dark:text-sage-400">
                  {assignedDoctor.specialty} • Your Health Advisor
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/app/doctor"
                className="p-2.5 text-warm-500 dark:text-neutral-400 hover:bg-warm-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <Info className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 bg-warm-50/50 dark:bg-neutral-950/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-sage-500" />
                </div>
                <p className="text-warm-500 dark:text-neutral-400">
                  Send a message to start your conversation
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === user?.uid;
                  const showTime =
                    index === 0 ||
                    new Date(message.timestamp).getTime() -
                      new Date(messages[index - 1].timestamp).getTime() >
                      300000;

                  return (
                    <div key={message.id}>
                      {showTime && (
                        <div className="flex justify-center my-6">
                          <span className="px-3 py-1 bg-white dark:bg-neutral-800 text-xs text-warm-500 dark:text-neutral-400 rounded-full shadow-sm">
                            {isToday(message.timestamp)
                              ? 'Today'
                              : isYesterday(message.timestamp)
                              ? 'Yesterday'
                              : format(message.timestamp, 'MMMM d, yyyy')}
                          </span>
                        </div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%]`}>
                          <div
                            className={`px-4 py-3 ${
                              isOwn
                                ? 'bg-sage-600 text-white rounded-2xl rounded-br-md'
                                : 'bg-white dark:bg-neutral-800 text-warm-900 dark:text-white rounded-2xl rounded-bl-md shadow-sm'
                            }`}
                          >
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                              {message.text}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 mt-1.5 px-1 ${
                              isOwn ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span className="text-[11px] text-warm-400 dark:text-neutral-500">
                              {format(message.timestamp, 'h:mm a')}
                            </span>
                            {isOwn && (
                              <CheckCheck
                                className={`w-3.5 h-3.5 ${
                                  message.read
                                    ? 'text-sage-500'
                                    : 'text-warm-300 dark:text-neutral-600'
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-warm-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <div className="flex-1 bg-warm-50 dark:bg-neutral-800 rounded-2xl border border-warm-100 dark:border-neutral-700 focus-within:border-sage-400 dark:focus-within:border-sage-600 focus-within:ring-2 focus-within:ring-sage-100 dark:focus-within:ring-sage-900/30 transition-all">
                <div className="flex items-center px-4 py-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent text-warm-900 dark:text-neutral-100 placeholder-warm-400 dark:placeholder-neutral-500 text-[15px] outline-none"
                  />
                  <button
                    type="button"
                    className="p-2 text-warm-400 dark:text-neutral-500 hover:text-warm-600 dark:hover:text-neutral-300 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className={`p-3.5 rounded-2xl transition-all ${
                  newMessage.trim()
                    ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-500/20'
                    : 'bg-warm-100 dark:bg-neutral-800 text-warm-400 dark:text-neutral-500'
                } disabled:cursor-not-allowed`}
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Doctor view: Patient list + chat
  return (
    <div className="h-[calc(100vh-120px)] max-w-7xl mx-auto px-4 md:px-6 py-4">
      <div className="h-full bg-white dark:bg-neutral-900 rounded-2xl border border-warm-100 dark:border-neutral-800 overflow-hidden shadow-sm flex">
        {/* Sidebar - Patient List */}
        <div
          className={`w-full md:w-96 border-r border-warm-100 dark:border-neutral-800 flex flex-col ${
            selectedConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-warm-100 dark:border-neutral-800">
            <h1 className="text-xl font-bold text-warm-900 dark:text-white mb-4">
              Your Patients
            </h1>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400 dark:text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patients..."
                className="w-full pl-10 pr-4 py-2.5 bg-warm-50 dark:bg-neutral-800 border-0 rounded-xl text-sm text-warm-900 dark:text-neutral-100 placeholder-warm-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-sage-500/20 dark:focus:ring-sage-500/30 transition-all outline-none"
              />
            </div>
          </div>

          {/* Patient List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-warm-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
                  <User className="w-8 h-8 text-warm-400 dark:text-neutral-500" />
                </div>
                <h3 className="text-lg font-semibold text-warm-700 dark:text-neutral-300 mb-2">
                  No patients yet
                </h3>
                <p className="text-sm text-warm-500 dark:text-neutral-400">
                  Patients will appear here when they're assigned to you
                </p>
              </div>
            ) : (
              <div className="divide-y divide-warm-50 dark:divide-neutral-800">
                {conversations
                  .filter((c) =>
                    c.patientName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((convo) => {
                    const isSelected = selectedConversation?.id === convo.id;
                    const hasUnread = convo.unreadCount > 0;

                    return (
                      <button
                        key={convo.id}
                        onClick={() => setSelectedConversation(convo)}
                        className={`w-full p-4 flex items-center gap-4 text-left transition-all hover:bg-warm-50 dark:hover:bg-neutral-800/50 ${
                          isSelected
                            ? 'bg-sage-50 dark:bg-sage-900/20 border-l-2 border-sage-500'
                            : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {convo.patientPhotoURL ? (
                            <img
                              src={convo.patientPhotoURL}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warm-100 to-warm-200 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center">
                              <User className="w-5 h-5 text-warm-500 dark:text-neutral-400" />
                            </div>
                          )}
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3
                              className={`font-semibold truncate ${
                                hasUnread
                                  ? 'text-warm-900 dark:text-white'
                                  : 'text-warm-700 dark:text-neutral-200'
                              }`}
                            >
                              {convo.patientName}
                            </h3>
                            {convo.lastMessageAt && (
                              <span
                                className={`text-xs flex-shrink-0 ml-2 ${
                                  hasUnread
                                    ? 'text-sage-600 dark:text-sage-400 font-medium'
                                    : 'text-warm-400 dark:text-neutral-500'
                                }`}
                              >
                                {formatMessageTime(convo.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            {convo.lastMessage ? (
                              <p
                                className={`text-sm truncate ${
                                  hasUnread
                                    ? 'text-warm-700 dark:text-neutral-300 font-medium'
                                    : 'text-warm-500 dark:text-neutral-400'
                                }`}
                              >
                                {convo.lastMessage}
                              </p>
                            ) : (
                              <p className="text-sm text-warm-400 dark:text-neutral-500 italic">
                                No messages yet
                              </p>
                            )}
                            {hasUnread && (
                              <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 px-1.5 bg-sage-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {convo.unreadCount > 9 ? '9+' : convo.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col ${
            selectedConversation ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-warm-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 -ml-2 text-warm-500 dark:text-neutral-400 hover:bg-warm-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    {selectedConversation.patientPhotoURL ? (
                      <img
                        src={selectedConversation.patientPhotoURL}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-warm-100 to-warm-200 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-warm-500 dark:text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-warm-900 dark:text-white">
                      {selectedConversation.patientName}
                    </h2>
                    <p className="text-xs text-warm-500 dark:text-neutral-400">Patient</p>
                  </div>
                </div>

                <button className="p-2.5 text-warm-500 dark:text-neutral-400 hover:bg-warm-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-warm-50/50 dark:bg-neutral-950/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-sage-500" />
                    </div>
                    <p className="text-warm-500 dark:text-neutral-400">
                      No messages yet with this patient
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isOwn = message.senderId === user?.uid;
                      const showTime =
                        index === 0 ||
                        new Date(message.timestamp).getTime() -
                          new Date(messages[index - 1].timestamp).getTime() >
                          300000;

                      return (
                        <div key={message.id}>
                          {showTime && (
                            <div className="flex justify-center my-6">
                              <span className="px-3 py-1 bg-white dark:bg-neutral-800 text-xs text-warm-500 dark:text-neutral-400 rounded-full shadow-sm">
                                {isToday(message.timestamp)
                                  ? 'Today'
                                  : isYesterday(message.timestamp)
                                  ? 'Yesterday'
                                  : format(message.timestamp, 'MMMM d, yyyy')}
                              </span>
                            </div>
                          )}

                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%]`}>
                              <div
                                className={`px-4 py-3 ${
                                  isOwn
                                    ? 'bg-sage-600 text-white rounded-2xl rounded-br-md'
                                    : 'bg-white dark:bg-neutral-800 text-warm-900 dark:text-white rounded-2xl rounded-bl-md shadow-sm'
                                }`}
                              >
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                                  {message.text}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-1.5 mt-1.5 px-1 ${
                                  isOwn ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <span className="text-[11px] text-warm-400 dark:text-neutral-500">
                                  {format(message.timestamp, 'h:mm a')}
                                </span>
                                {isOwn && (
                                  <CheckCheck
                                    className={`w-3.5 h-3.5 ${
                                      message.read
                                        ? 'text-sage-500'
                                        : 'text-warm-300 dark:text-neutral-600'
                                    }`}
                                  />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-warm-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                  <div className="flex-1 bg-warm-50 dark:bg-neutral-800 rounded-2xl border border-warm-100 dark:border-neutral-700 focus-within:border-sage-400 dark:focus-within:border-sage-600 focus-within:ring-2 focus-within:ring-sage-100 dark:focus-within:ring-sage-900/30 transition-all">
                    <div className="flex items-center px-4 py-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent text-warm-900 dark:text-neutral-100 placeholder-warm-400 dark:placeholder-neutral-500 text-[15px] outline-none"
                      />
                      <button
                        type="button"
                        className="p-2 text-warm-400 dark:text-neutral-500 hover:text-warm-600 dark:hover:text-neutral-300 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className={`p-3.5 rounded-2xl transition-all ${
                      newMessage.trim()
                        ? 'bg-sage-600 hover:bg-sage-700 text-white shadow-lg shadow-sage-500/20'
                        : 'bg-warm-100 dark:bg-neutral-800 text-warm-400 dark:text-neutral-500'
                    } disabled:cursor-not-allowed`}
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-warm-50/30 dark:bg-neutral-950/30">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sage-100 to-sage-200 dark:from-sage-900/40 dark:to-sage-800/40 flex items-center justify-center mb-6 shadow-lg shadow-sage-500/10">
                <MessageCircle className="w-12 h-12 text-sage-600 dark:text-sage-400" />
              </div>
              <h2 className="text-2xl font-bold text-warm-900 dark:text-white mb-3">
                Select a Patient
              </h2>
              <p className="text-warm-500 dark:text-neutral-400 max-w-sm">
                Choose a patient from the list to view their messages and provide guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
