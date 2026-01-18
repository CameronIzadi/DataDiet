// Messaging Service for Doctor-Patient Communication
// Auto-pairing system - patients are automatically matched with doctors

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  getDoc,
  limit,
  serverTimestamp,
  increment,
  runTransaction,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebaseClient';
import { DoctorProfile, Connection, Message, Conversation } from '@/types';

// ============================================
// Doctor Profile Helpers
// ============================================

function parseDoctorProfile(docSnapshot: any): DoctorProfile {
  const data = docSnapshot.data();
  return {
    uid: docSnapshot.id,
    email: data.email,
    displayName: data.displayName,
    role: 'doctor',
    verificationStatus: data.verificationStatus,
    npiNumber: data.npiNumber,
    licenseNumber: data.licenseNumber,
    licenseState: data.licenseState,
    specialty: data.specialty,
    practiceName: data.practiceName,
    practiceAddress: data.practiceAddress,
    yearsOfExperience: data.yearsOfExperience,
    medicalSchool: data.medicalSchool,
    photoURL: data.photoURL,
    createdAt: data.createdAt?.toDate() || new Date(),
    acceptingNewPatients: data.acceptingNewPatients ?? true,
    maxPatients: data.maxPatients ?? 50,
    currentPatientCount: data.currentPatientCount ?? 0,
    bio: data.bio,
  };
}

// ============================================
// Auto-Pairing System
// ============================================

/**
 * Get an available doctor for auto-pairing
 * Returns the doctor with the fewest patients who is accepting new patients
 */
export async function getAvailableDoctor(): Promise<DoctorProfile | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const doctorsRef = collection(db, 'doctors');
    // Get verified doctors who are accepting new patients
    const q = query(
      doctorsRef,
      where('verificationStatus', '==', 'verified'),
      where('acceptingNewPatients', '==', true)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    // Find doctor with fewest patients (who hasn't reached max)
    let bestDoctor: DoctorProfile | null = null;
    let lowestPatientCount = Infinity;

    snapshot.forEach((docSnapshot) => {
      const doctor = parseDoctorProfile(docSnapshot);
      if (
        doctor.currentPatientCount < doctor.maxPatients &&
        doctor.currentPatientCount < lowestPatientCount
      ) {
        lowestPatientCount = doctor.currentPatientCount;
        bestDoctor = doctor;
      }
    });

    return bestDoctor;
  } catch (error) {
    console.error('Error getting available doctor:', error);
    return null;
  }
}

/**
 * Get the user's currently assigned doctor
 */
export async function getAssignedDoctor(patientId: string): Promise<{
  connection: Connection;
  doctor: DoctorProfile;
  conversation: Conversation;
} | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    // Find active connection for this patient
    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('patientId', '==', patientId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const connectionDoc = snapshot.docs[0];
    const connectionData = connectionDoc.data();

    const connection: Connection = {
      id: connectionDoc.id,
      doctorId: connectionData.doctorId,
      patientId: connectionData.patientId,
      status: connectionData.status,
      assignedAt: connectionData.assignedAt?.toDate() || new Date(),
      assignedBy: connectionData.assignedBy || 'system',
      doctorName: connectionData.doctorName,
      doctorSpecialty: connectionData.doctorSpecialty,
      doctorPhotoURL: connectionData.doctorPhotoURL,
      doctorBio: connectionData.doctorBio,
      patientName: connectionData.patientName,
      patientEmail: connectionData.patientEmail,
      patientPhotoURL: connectionData.patientPhotoURL,
    };

    // Get full doctor profile
    const doctorDoc = await getDoc(doc(db, 'doctors', connection.doctorId));
    if (!doctorDoc.exists()) return null;

    const doctor = parseDoctorProfile(doctorDoc);

    // Get or create conversation
    const conversationId = `${connection.doctorId}_${connection.patientId}`;
    const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));

    let conversation: Conversation;
    if (conversationDoc.exists()) {
      const convData = conversationDoc.data();
      conversation = {
        id: conversationDoc.id,
        doctorId: convData.doctorId,
        patientId: convData.patientId,
        doctorName: convData.doctorName,
        patientName: convData.patientName,
        doctorPhotoURL: convData.doctorPhotoURL,
        patientPhotoURL: convData.patientPhotoURL,
        doctorSpecialty: convData.doctorSpecialty,
        lastMessage: convData.lastMessage,
        lastMessageAt: convData.lastMessageAt?.toDate(),
        unreadCount: convData.unreadCount || 0,
        createdAt: convData.createdAt?.toDate() || new Date(),
      };
    } else {
      // Create conversation if it doesn't exist
      await setDoc(doc(db, 'conversations', conversationId), {
        doctorId: connection.doctorId,
        patientId: connection.patientId,
        doctorName: connection.doctorName,
        patientName: connection.patientName,
        doctorPhotoURL: connection.doctorPhotoURL || null,
        patientPhotoURL: connection.patientPhotoURL || null,
        doctorSpecialty: connection.doctorSpecialty || null,
        lastMessage: null,
        lastMessageAt: null,
        unreadCount: 0,
        createdAt: serverTimestamp(),
      });

      conversation = {
        id: conversationId,
        doctorId: connection.doctorId,
        patientId: connection.patientId,
        doctorName: connection.doctorName,
        patientName: connection.patientName,
        doctorPhotoURL: connection.doctorPhotoURL,
        patientPhotoURL: connection.patientPhotoURL,
        doctorSpecialty: connection.doctorSpecialty,
        lastMessage: undefined,
        lastMessageAt: undefined,
        unreadCount: 0,
        createdAt: new Date(),
      };
    }

    return { connection, doctor, conversation };
  } catch (error) {
    console.error('Error getting assigned doctor:', error);
    return null;
  }
}

/**
 * Auto-pair a patient with an available doctor
 * Creates connection and conversation automatically
 */
export async function autoPairWithDoctor(
  patientId: string,
  patientName: string,
  patientEmail: string,
  patientPhotoURL?: string
): Promise<{
  connection: Connection;
  doctor: DoctorProfile;
  conversation: Conversation;
} | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    // Check if already paired
    const existing = await getAssignedDoctor(patientId);
    if (existing) return existing;

    // Get available doctor
    const doctor = await getAvailableDoctor();
    if (!doctor) {
      console.log('No available doctors for pairing');
      return null;
    }

    // Use transaction to ensure atomic operation
    const connectionId = `${doctor.uid}_${patientId}`;
    const conversationId = `${doctor.uid}_${patientId}`;
    const firestore = db!; // We've already checked db is not null above

    await runTransaction(firestore, async (transaction) => {
      // Create connection
      const connectionRef = doc(firestore, 'connections', connectionId);
      transaction.set(connectionRef, {
        doctorId: doctor.uid,
        patientId,
        status: 'active',
        assignedAt: serverTimestamp(),
        assignedBy: 'system',
        doctorName: doctor.displayName,
        doctorSpecialty: doctor.specialty,
        doctorPhotoURL: doctor.photoURL || null,
        doctorBio: doctor.bio || null,
        patientName,
        patientEmail,
        patientPhotoURL: patientPhotoURL || null,
      });

      // Create conversation
      const conversationRef = doc(firestore, 'conversations', conversationId);
      transaction.set(conversationRef, {
        doctorId: doctor.uid,
        patientId,
        doctorName: doctor.displayName,
        patientName,
        doctorPhotoURL: doctor.photoURL || null,
        patientPhotoURL: patientPhotoURL || null,
        doctorSpecialty: doctor.specialty || null,
        lastMessage: null,
        lastMessageAt: null,
        unreadCount: 0,
        createdAt: serverTimestamp(),
      });

      // Increment doctor's patient count
      const doctorRef = doc(firestore, 'doctors', doctor.uid);
      transaction.update(doctorRef, {
        currentPatientCount: increment(1),
      });
    });

    // Return the created data
    const connection: Connection = {
      id: connectionId,
      doctorId: doctor.uid,
      patientId,
      status: 'active',
      assignedAt: new Date(),
      assignedBy: 'system',
      doctorName: doctor.displayName,
      doctorSpecialty: doctor.specialty,
      doctorPhotoURL: doctor.photoURL,
      doctorBio: doctor.bio,
      patientName,
      patientEmail,
      patientPhotoURL,
    };

    const conversation: Conversation = {
      id: conversationId,
      doctorId: doctor.uid,
      patientId,
      doctorName: doctor.displayName,
      patientName,
      doctorPhotoURL: doctor.photoURL,
      patientPhotoURL,
      doctorSpecialty: doctor.specialty,
      lastMessage: undefined,
      lastMessageAt: undefined,
      unreadCount: 0,
      createdAt: new Date(),
    };

    return { connection, doctor, conversation };
  } catch (error) {
    console.error('Error auto-pairing with doctor:', error);
    return null;
  }
}

/**
 * Send welcome message from doctor (called after pairing)
 */
export async function sendWelcomeMessage(
  conversationId: string,
  doctorId: string,
  doctorName: string,
  patientName: string
): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const welcomeMessage = `Hi ${patientName}! I'm ${doctorName}, and I've been assigned as your health advisor. I'm here to help you with your dietary goals and answer any questions you have. Feel free to message me anytime!`;

    await sendMessage(conversationId, doctorId, doctorName, 'doctor', welcomeMessage);
  } catch (error) {
    console.error('Error sending welcome message:', error);
  }
}

// ============================================
// Doctor Profile
// ============================================

/**
 * Get a doctor's profile by ID
 */
export async function getDoctorProfile(doctorId: string): Promise<DoctorProfile | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    const docRef = doc(db, 'doctors', doctorId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;
    return parseDoctorProfile(snapshot);
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return null;
  }
}

// ============================================
// For Doctors: Patient Management
// ============================================

/**
 * Get all patients for a doctor
 */
export async function getPatientsForDoctor(doctorId: string): Promise<Connection[]> {
  if (!db || !isFirebaseConfigured) return [];

  try {
    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('doctorId', '==', doctorId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);

    const connections: Connection[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      connections.push({
        id: docSnapshot.id,
        doctorId: data.doctorId,
        patientId: data.patientId,
        status: data.status,
        assignedAt: data.assignedAt?.toDate() || new Date(),
        assignedBy: data.assignedBy || 'system',
        doctorName: data.doctorName,
        doctorSpecialty: data.doctorSpecialty,
        doctorPhotoURL: data.doctorPhotoURL,
        doctorBio: data.doctorBio,
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        patientPhotoURL: data.patientPhotoURL,
      });
    });

    return connections;
  } catch (error) {
    console.error('Error getting patients:', error);
    return [];
  }
}

/**
 * Subscribe to patient list for a doctor
 */
export function subscribeToPatients(
  doctorId: string,
  onUpdate: (patients: Connection[]) => void
): () => void {
  if (!db || !isFirebaseConfigured) return () => {};

  const connectionsRef = collection(db, 'connections');
  const q = query(
    connectionsRef,
    where('doctorId', '==', doctorId),
    where('status', '==', 'active')
  );

  return onSnapshot(q, (snapshot) => {
    const connections: Connection[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      connections.push({
        id: docSnapshot.id,
        doctorId: data.doctorId,
        patientId: data.patientId,
        status: data.status,
        assignedAt: data.assignedAt?.toDate() || new Date(),
        assignedBy: data.assignedBy || 'system',
        doctorName: data.doctorName,
        doctorSpecialty: data.doctorSpecialty,
        doctorPhotoURL: data.doctorPhotoURL,
        doctorBio: data.doctorBio,
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        patientPhotoURL: data.patientPhotoURL,
      });
    });
    onUpdate(connections);
  });
}

// ============================================
// Conversation Management
// ============================================

/**
 * Get all conversations for a user
 */
export async function getConversationsForUser(userId: string): Promise<Conversation[]> {
  if (!db || !isFirebaseConfigured) return [];

  try {
    const conversationsRef = collection(db, 'conversations');

    // Query for conversations where user is either doctor or patient
    const doctorQuery = query(conversationsRef, where('doctorId', '==', userId));
    const patientQuery = query(conversationsRef, where('patientId', '==', userId));

    const [doctorSnapshot, patientSnapshot] = await Promise.all([
      getDocs(doctorQuery),
      getDocs(patientQuery),
    ]);

    const conversations: Conversation[] = [];
    const processDoc = (docSnapshot: any) => {
      const data = docSnapshot.data();
      conversations.push({
        id: docSnapshot.id,
        doctorId: data.doctorId,
        patientId: data.patientId,
        doctorName: data.doctorName,
        patientName: data.patientName,
        doctorPhotoURL: data.doctorPhotoURL,
        patientPhotoURL: data.patientPhotoURL,
        doctorSpecialty: data.doctorSpecialty,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate(),
        unreadCount: data.unreadCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    };

    doctorSnapshot.forEach(processDoc);
    patientSnapshot.forEach(processDoc);

    // Remove duplicates and sort by last message
    const uniqueConversations = Array.from(
      new Map(conversations.map((c) => [c.id, c])).values()
    ).sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    });

    return uniqueConversations;
  } catch (error) {
    console.error('Error getting conversations:', error);
    return [];
  }
}

/**
 * Subscribe to conversations for a user
 */
export function subscribeToConversations(
  userId: string,
  onUpdate: (conversations: Conversation[]) => void
): () => void {
  if (!db || !isFirebaseConfigured) return () => {};

  const conversationsRef = collection(db, 'conversations');

  // We need to listen to both queries
  const doctorQuery = query(conversationsRef, where('doctorId', '==', userId));
  const patientQuery = query(conversationsRef, where('patientId', '==', userId));

  let doctorConversations: Conversation[] = [];
  let patientConversations: Conversation[] = [];

  const processAndUpdate = () => {
    const all = [...doctorConversations, ...patientConversations];
    const unique = Array.from(new Map(all.map((c) => [c.id, c])).values()).sort(
      (a, b) => {
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
      }
    );
    onUpdate(unique);
  };

  const unsubDoctor = onSnapshot(doctorQuery, (snapshot) => {
    doctorConversations = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      doctorConversations.push({
        id: docSnapshot.id,
        doctorId: data.doctorId,
        patientId: data.patientId,
        doctorName: data.doctorName,
        patientName: data.patientName,
        doctorPhotoURL: data.doctorPhotoURL,
        patientPhotoURL: data.patientPhotoURL,
        doctorSpecialty: data.doctorSpecialty,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate(),
        unreadCount: data.unreadCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    processAndUpdate();
  });

  const unsubPatient = onSnapshot(patientQuery, (snapshot) => {
    patientConversations = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      patientConversations.push({
        id: docSnapshot.id,
        doctorId: data.doctorId,
        patientId: data.patientId,
        doctorName: data.doctorName,
        patientName: data.patientName,
        doctorPhotoURL: data.doctorPhotoURL,
        patientPhotoURL: data.patientPhotoURL,
        doctorSpecialty: data.doctorSpecialty,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt?.toDate(),
        unreadCount: data.unreadCount || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });
    processAndUpdate();
  });

  return () => {
    unsubDoctor();
    unsubPatient();
  };
}

// ============================================
// Message Management
// ============================================

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderRole: 'doctor' | 'patient',
  text: string
): Promise<string | null> {
  if (!db || !isFirebaseConfigured) return null;

  try {
    // Add message to subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageDoc = await addDoc(messagesRef, {
      conversationId,
      senderId,
      senderName,
      senderRole,
      text,
      timestamp: serverTimestamp(),
      read: false,
    });

    // Update conversation with last message
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: text.length > 50 ? text.substring(0, 50) + '...' : text,
      lastMessageAt: serverTimestamp(),
    });

    return messageDoc.id;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> {
  if (!db || !isFirebaseConfigured) return [];

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(limitCount));
    const snapshot = await getDocs(q);

    const messages: Message[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      messages.push({
        id: docSnapshot.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        text: data.text,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read,
      });
    });

    return messages;
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
}

/**
 * Subscribe to messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onUpdate: (messages: Message[]) => void
): () => void {
  if (!db || !isFirebaseConfigured) return () => {};

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      messages.push({
        id: docSnapshot.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: data.senderRole,
        text: data.text,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read,
      });
    });
    onUpdate(messages);
  });
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  if (!db || !isFirebaseConfigured) return;

  try {
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      where('read', '==', false),
      where('senderId', '!=', userId)
    );
    const snapshot = await getDocs(q);

    const firestore = db!;
    const updates = snapshot.docs.map((docSnapshot) =>
      updateDoc(doc(firestore, 'conversations', conversationId, 'messages', docSnapshot.id), {
        read: true,
      })
    );

    await Promise.all(updates);

    // Reset unread count on conversation
    const conversationRef = doc(firestore, 'conversations', conversationId);
    await updateDoc(conversationRef, { unreadCount: 0 });
  } catch (error) {
    console.error('Error marking messages as read:', error);
  }
}
