import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';


/**
 * Types globaux pour l'application
 * 
 * IMPORTANT : Les types Course, AuthUser, etc. sont importés depuis api.ts
 * pour être alignés avec le backend NestJS
 */

// ═══════════════════════════════════════════════════════════
// RE-EXPORT DEPUIS API.TS (Types alignés avec le backend)
// ═══════════════════════════════════════════════════════════
export * from './api';

// ═══════════════════════════════════════════════════════════
// COUNTRY CODES
// ═══════════════════════════════════════════════════════════
export interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
  placeholder: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'SN', dial: '+221', flag: '🇸🇳', name: 'Sénégal', placeholder: '77 123 45 67' },
  { code: 'CI', dial: '+225', flag: '🇨🇮', name: 'Côte d\'Ivoire', placeholder: '07 00 00 00 00' },
  { code: 'CM', dial: '+237', flag: '🇨🇲', name: 'Cameroun', placeholder: '6 70 00 00 00' },
  { code: 'ML', dial: '+223', flag: '🇲🇱', name: 'Mali', placeholder: '70 00 00 00' },
  { code: 'BF', dial: '+226', flag: '🇧🇫', name: 'Burkina Faso', placeholder: '70 00 00 00' },
  { code: 'GN', dial: '+224', flag: '🇬🇳', name: 'Guinée', placeholder: '620 00 00 00' },
  { code: 'BJ', dial: '+229', flag: '🇧🇯', name: 'Bénin', placeholder: '90 00 00 00' },
  { code: 'TG', dial: '+228', flag: '🇹🇬', name: 'Togo', placeholder: '90 00 00 00' },
  { code: 'NE', dial: '+227', flag: '🇳🇪', name: 'Niger', placeholder: '90 00 00 00' },
  { code: 'GA', dial: '+241', flag: '🇬🇦', name: 'Gabon', placeholder: '06 00 00 00' },
  { code: 'CG', dial: '+242', flag: '🇨🇬', name: 'Congo', placeholder: '06 000 0000' },
  { code: 'CD', dial: '+243', flag: '🇨🇩', name: 'RD Congo', placeholder: '81 000 0000' },
  { code: 'MG', dial: '+261', flag: '🇲🇬', name: 'Madagascar', placeholder: '32 00 000 00' },
  { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France', placeholder: '06 00 00 00 00' },
];

// ═══════════════════════════════════════════════════════════
// GOOGLE AUTH (pour window.google)
// ═══════════════════════════════════════════════════════════

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleInitConfig) => void;
          renderButton: (element: HTMLElement | null, config: GoogleButtonConfig) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

export interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number | string;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  locale?: string;
}

export interface GoogleCredentialResponse {
  credential: string; // JWT token
  select_by?: string;
  clientId?: string;
}

export interface GoogleJwtPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string; // Google ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

// ═══════════════════════════════════════════════════════════
// PASS TRANSACTIONS
// ═══════════════════════════════════════════════════════════



export type Provider = 'wave' | 'orange_money';
export type ActionType = 'PURCHASE' | 'IA_CHAT' | 'IA_EXERCISE' | 'IA_ANALYZE' | 'IA_SUMMARY' | 'IA_DIAGNOSTIC';

// ✅ Nouvelle interface pour le solde (API /pass/balance)
export interface PassBalance {
  userId: string;
  totalTokens: number;
  remainingPasses: number;
  updatedAt: string;
}

// ✅ Nouvelle interface pour les transactions (API /pass/history)
export interface PassTransaction {
  id: string;
  amount: number;  // En tokens
  actionType: ActionType;
  metadata?: {
    packageId?: string;
    courseId?: string;
    messageId?: string;
  };
  createdAt: string;
}

export interface PassHistoryResponse {
  total: number;
  transactions: PassTransaction[];
}

// ✅ Nouvelle interface pour les packs (API /payments/packages)
export interface PassPackage {
  id: string;
  name: string;
  passAmount: number;
  tokenEquivalent: number;
  priceCfa: number;
  pricePerPass: number;
  savings?: number;
  recommended?: boolean;
  isActive: boolean;
}

// ✅ Interface pour la création de paiement (API /payments/create)
export interface CreatePaymentPayload {
  provider: Provider;
  packageId: string;
  phoneNumber: string;
}

export interface CreatePaymentResponse {
  transactionId: string;
  paymentUrl: string;
  providerSessionId: string;
  amount: number;
  passQuantity: number;
}

// ✅ Interface pour le statut de paiement (API /payments/{id}/status)
export interface PaymentStatusResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  passQuantity: number;
}

// ⚠️ Ancienne interface UserBalance (à conserver temporairement pour compatibilité)
export interface UserBalance {
  balance: number;
  transactions: PassTransaction[];
}


  
// ═══════════════════════════════════════════════════════════
// COURSE CATEGORIES (Nouveau système)
// ═══════════════════════════════════════════════════════════
export type CourseSubject = 'math' | 'Langues';

export interface CourseCategory {
  value: CourseSubject;
  label: string;
  emoji: string;
  color: string;
}

export const COURSE_CATEGORIES: CourseCategory[] = [
  { 
    value: 'math', 
    label: 'Mathématiques', 
    emoji: '📐',
    color: 'from-blue-500 to-purple-600'
  },
  { 
    value: 'Langues', 
    label: 'Langues', 
    emoji: '🌍',
    color: 'from-green-500 to-teal-600'
  },
];

// ═══════════════════════════════════════════════════════════
// SCHOOL LEVELS (Nouveau système)
// ═══════════════════════════════════════════════════════════
export type SchoolLevel = 'Seconde' | 'Premiere' | 'Terminale';

export interface SchoolLevelOption {
  value: SchoolLevel;
  label: string;
  emoji: string;
}

export const SCHOOL_LEVELS: SchoolLevelOption[] = [
  { value: 'Seconde', label: 'Seconde', emoji: '📚' },
  { value: 'Premiere', label: 'Première', emoji: '📖' },
  { value: 'Terminale', label: 'Terminale', emoji: '🎓' },
];

// ═══════════════════════════════════════════════════════════
// UI TYPES
// ═══════════════════════════════════════════════════════════
export type ToastVariant = 'default' | 'destructive' | 'success';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// ═══════════════════════════════════════════════════════════
// TYPES LEGACY (Déprécié - utiliser ceux depuis api.ts)
// ═══════════════════════════════════════════════════════════

/**
 * @deprecated Utiliser AuthUser depuis @/types/api à la place
 */
export interface User {
  id: string;
  phone: string;
  country_code: string;
  first_name?: string;
  last_name?: string;
  school_level: 'seconde' | 'premiere' | 'terminale';
  created_at: string;
}

/**
 * @deprecated Utiliser les nouveaux flows depuis api.ts
 */
export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  school_level: 'seconde' | 'premiere' | 'terminale';
}

/**
 * @deprecated L'ancien système d'auth est remplacé
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

/**
 * @deprecated Utiliser le nouveau flow registerRequest/registerVerify
 */
export interface VerifyOtpResponse {
  is_new_user: boolean;
  session?: AuthSession;
  temp_token?: string;
}

/**
 * @deprecated Utiliser LoginRequestPayload depuis api.ts
 */
export interface LoginPayload {
  phone: string;
  country_code: string;
}

/**
 * @deprecated Utiliser les nouveaux DTOs depuis api.ts
 */
export interface SendOtpPayload {
  phone: string;
  country_code: string;
  flow: 'login' | 'register';
}

/**
 * @deprecated Utiliser RegisterVerifyPayload ou LoginVerifyPayload depuis api.ts
 */
export interface VerifyOtpPayload {
  phone: string;
  country_code: string;
  otp: string;
  flow: 'login' | 'register';
}

/**
 * @deprecated Utiliser RegisterVerifyPayload depuis api.ts
 */
export interface RegisterPayload {
  phone: string;
  country_code: string;
  first_name: string;
  last_name: string;
  school_level: 'seconde' | 'premiere' | 'terminale';
}

/**
 * @deprecated Le flow a changé - pas de temp_token
 */
export interface CompleteProfilePayload {
  temp_token: string;
  first_name: string;
  last_name: string;
  school_level: 'seconde' | 'premiere' | 'terminale';
}

/**
 * @deprecated Utiliser user.passBalance depuis AuthUser
 */
export interface PassBalance {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

/**
 * @deprecated Utiliser CourseSubject depuis ce fichier ('math' | 'Langues')
 */
export type OldCourseCategory = 'mathematiques' | 'francais' | 'anglais';

/**
 * @deprecated Utiliser COURSE_CATEGORIES depuis ce fichier
 */
export const OLD_COURSE_CATEGORIES: { value: OldCourseCategory; label: string; emoji: string }[] = [
  { value: 'mathematiques', label: 'Mathématiques', emoji: '📐' },
  { value: 'francais', label: 'Français', emoji: '📖' },
  { value: 'anglais', label: 'Anglais', emoji: '🇬🇧' },
];

// Note: Pour les types Course, AuthUser, ApiError, etc.
// Importez-les depuis @/types/api qui est aligné avec le backend

export interface PassTransaction {
  id: string;
  amount: number;
  price: number;
  payment_method: 'wave' | 'orange_money';
  created_at: string;
}
// types/index.ts - Ajouter/Mettre à jour
