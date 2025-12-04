
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum Gender {
  MALE = 'Homme',
  FEMALE = 'Femme',
  MIXED = 'Mixte' // Only for classes
}

export enum ContentType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT'
}

export enum EnrollmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PREMIUM_MONTHLY = 'PREMIUM_MONTHLY',
  PREMIUM_YEARLY = 'PREMIUM_YEARLY'
}

export interface Badge {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  description: string;
  unlockedAt?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  gender: 'Homme' | 'Femme';
  joinedAt: string;
  // Gamification & Advanced
  xp: number;
  level: number;
  badges: Badge[];
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry?: string;
  referralCode: string;
  referredBy?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  level: string; // 0 to X
  gender: Gender;
  capacity: number;
  description: string;
  studentIds: string[];
}

export interface Content {
  id: string;
  classId: string;
  title: string;
  description: string;
  type: ContentType;
  dataUrl: string; // Base64 or ObjectURL
  fileName: string;
  createdAt: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text?: string;
  audioUrl?: string; // Base64 audio data
  createdAt: string;
}

export interface EnrollmentRequest {
  id: string;
  userId: string;
  userName: string;
  classId: string;
  className: string;
  status: EnrollmentStatus;
  requestedAt: string;
}

// --- NOUVELLES INTERFACES (V1 & V2) ---

export enum QuestionType {
  MCQ_SINGLE = 'MCQ_SINGLE', // Choix unique
  MCQ_MULTI = 'MCQ_MULTI',   // Choix multiple
  TRUE_FALSE = 'TRUE_FALSE', // Vrai/Faux
  OPEN = 'OPEN',             // Texte libre
  AUDIO_RECITATION = 'AUDIO_RECITATION' // Enregistrement vocal élève
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  audioPromptUrl?: string; // Pour question audio (écouter puis répondre)
  options?: string[]; // Pour QCM
  correctAnswers?: string[]; // Pour auto-correction (indices des options ou valeur bool)
  points: number;
  explanation?: string; // Affiché après la réponse
}

export interface Quiz {
  id: string;
  classId: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimitMinutes: number; // 0 = illimité
  passingScore: number; // Pourcentage
  maxAttempts: number;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, any>; // questionId -> answer
  score: number; // Calculé
  passed: boolean;
  startedAt: string;
  completedAt: string;
  teacherFeedback?: string; // Pour correction manuelle
}

export interface LiveSession {
  id: string;
  classId: string;
  title: string;
  description: string;
  platform: 'Google Meet' | 'Zoom' | 'Autre';
  meetingLink: string;
  scheduledAt: string; // ISO Date
  durationMinutes: number;
  isRecorded: boolean;
  recordingUrl?: string;
}

export interface Notification {
  id: string;
  userId: string; // 'ADMIN' or specific userId
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  createdAt: string;
  linkTo?: string; // View ID to navigate to
}

// V2 Specifics

export interface ForumPost {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: string; // 'General', 'Tajwid', 'Fiqh'
  likes: number;
  replies: Comment[];
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  category: 'TAFSIR' | 'TAJWID' | 'DUA' | 'HISTORY';
  content: string; // HTML or Text
  mediaUrl?: string;
}

export const LEVELS = [
  "Niveau 0 : Initiation",
  "Niveau 1 : Débutant",
  "Niveau 2 : Élémentaire",
  "Niveau 3 : Intermédiaire",
  "Niveau 4 : Intermédiaire+",
  "Niveau 5 : Avancé",
  "Niveau X : Expert"
];

export const BADGES_LIST = [
  { id: 'b1', name: 'Assiduité', icon: '📅', description: 'S\'est connecté 7 jours d\'affilée' },
  { id: 'b2', name: 'Expert', icon: '🏆', description: 'A obtenu 100% à un quiz' },
  { id: 'b3', name: 'Commentateur', icon: '💬', description: 'A posté 10 commentaires utiles' },
  { id: 'b4', name: 'Ambassadeur', icon: '🤝', description: 'A parrainé 5 nouveaux élèves' },
  { id: 'b5', name: 'Récitateur', icon: '🎤', description: 'A soumis 5 devoirs audio' }
];
