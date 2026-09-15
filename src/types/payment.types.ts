// types/payment.types.ts
export type Provider = 'wave' | 'orange_money';
export type ActionType = 'PURCHASE' | 'IA_CHAT' | 'IA_EXERCISE' | 'IA_ANALYZE' | 'IA_SUMMARY' | 'IA_DIAGNOSTIC';

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

export interface CreatePaymentPayload {
  provider: Provider;
  packageId: string;  // ✅ Changé de packageId (pas passPackage)
  phoneNumber: string;
}

export interface CreatePaymentResponse {
  transactionId: string;
  paymentUrl: string;
  providerSessionId: string;
  amount: number;
  passQuantity: number;
}

export interface PaymentStatusResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  passQuantity: number;
}

export interface PackagesResponse {
  packages: PassPackage[];
}

export interface PassBalance {
  userId: string;
  totalTokens: number;
  remainingPasses: number;
  updatedAt: string;
}

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

export interface EstimateRequest {
  actionType: ActionType;
  fileSizeMb?: number;  // Pour IA_ANALYZE
}

export interface EstimateResponse {
  actionType: ActionType;
  fileSizeMb?: number;
  estimatedCost: number;
  currentBalance: number;
  hasEnough: boolean;
  remainingAfter: number;
}