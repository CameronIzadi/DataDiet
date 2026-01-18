// Core types for DataDiet

export interface Food {
  name: string;
  portion: string;
  container?: 'plastic_bottle' | 'glass' | 'can' | 'none';
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
}

export type MealFlag = 
  | 'plastic_bottle' 
  | 'plastic_container_hot'
  | 'processed_meat' 
  | 'ultra_processed'
  | 'charred_grilled'
  | 'fried'
  | 'high_sugar_beverage'
  | 'caffeine'
  | 'alcohol'
  | 'high_sodium'
  | 'refined_grain'
  | 'spicy_irritant'
  | 'acidic_trigger'
  | 'late_meal';

export interface Meal {
  id: string;
  loggedAt: Date;
  foods: Food[];
  flags: MealFlag[];
  imageUrl?: string;
  nutrition?: Nutrition;
}

// Individual blood work metric with value and reference range
export interface BloodWorkMetric {
  value: number;
  unit: string;
  referenceRange?: string;
  status?: 'low' | 'normal' | 'borderline' | 'high';
}

export interface BloodWork {
  id: string;
  testDate: Date;
  // Core lipid panel
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  // Glucose
  fastingGlucose?: number;
  hba1c?: number;
  // Additional metrics extracted from report
  metrics?: Record<string, BloodWorkMetric>;
  // Source file (base64 or URL)
  sourceFile?: string;
  sourceFileName?: string;
}

export interface BloodWorkStatus {
  totalCholesterol: 'normal' | 'borderline' | 'high';
  ldl: 'optimal' | 'near_optimal' | 'borderline' | 'high' | 'very_high';
  hdl: 'low' | 'normal' | 'high';
  triglycerides: 'normal' | 'borderline' | 'high' | 'very_high';
  fastingGlucose: 'normal' | 'borderline' | 'high';
}

export interface InsightMetric {
  value: number;
  label: string;
  context: string;
  concernLevel: 'low' | 'moderate' | 'elevated';
}

export interface Insights {
  totalMeals: number;
  dateRange: string;
  plastic: {
    count: number;
    perDay: number;
    concernLevel: 'low' | 'moderate' | 'elevated';
  };
  processedMeat: {
    count: number;
    perWeek: number;
    concernLevel: 'low' | 'moderate' | 'elevated';
  };
  mealTiming: {
    lateMealPercent: number;
    avgDinnerTime: string;
    concernLevel: 'low' | 'moderate' | 'elevated';
  };
  patterns: {
    busiestDay: string;
    weekendVsWeekday: string;
  };
}

export interface GeminiFoodAnalysis {
  foods: Food[];
  flags: MealFlag[];
  estimated_nutrition: Nutrition;
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// ============================================
// Doctor-Patient Connection & Messaging Types
// ============================================

export type ConnectionStatus = 'active' | 'ended';

export interface DoctorProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'doctor';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  npiNumber: string;
  licenseNumber: string;
  licenseState: string;
  specialty: string;
  practiceName: string;
  practiceAddress: string;
  yearsOfExperience: string;
  medicalSchool: string;
  photoURL?: string;
  createdAt: Date;
  // Auto-pairing fields
  acceptingNewPatients: boolean;
  maxPatients: number;
  currentPatientCount: number;
  bio?: string; // Short intro message
}

export interface Connection {
  id: string;
  doctorId: string;
  patientId: string;
  status: ConnectionStatus;
  assignedAt: Date;
  assignedBy: 'system' | 'manual';
  // Denormalized for easier queries
  doctorName: string;
  doctorSpecialty: string;
  doctorPhotoURL?: string;
  doctorBio?: string;
  patientName: string;
  patientEmail: string;
  patientPhotoURL?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient';
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  doctorId: string;
  patientId: string;
  doctorName: string;
  patientName: string;
  doctorPhotoURL?: string;
  patientPhotoURL?: string;
  doctorSpecialty?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
}

