export interface ThemeStyle {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  subtitle: string;
  photosRequired: number;
  photoLabels: string[];
  photoTips: string[];
  promptTemplate: string;
  availableStyles: ThemeStyle[];
  active: boolean;
  exampleImage: string;
  emotionalCopy: string;
  badge?: string;
}

export type OrderStatus =
  | 'pendente'
  | 'processando'
  | 'aguardando_pagamento'
  | 'pago'
  | 'concluido'
  | 'erro';

export interface Order {
  id: string;
  themeId: string;
  themeName: string;
  customerEmail: string;
  customerName?: string;
  photos: string[]; // Uploaded photos
  styleChosen: string;
  status: OrderStatus;
  previewUrl?: string; // Watermarked public URL
  hasMasterImage: boolean;
  downloadToken?: string;
  downloadExpiresAt?: string; // ISO 48h
  creditsUsed: number;
  priceBrl: number;
  createdAt: string;
  completedAt?: string;
  customNotes?: string;
  errorMessage?: string;
  paymentId?: string;
}

export interface CreditAccount {
  email: string;
  creditsAvailable: number;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId?: string;
  creditPackId?: string;
  customerEmail: string;
  amountBrl: number;
  gateway: 'mercado_pago';
  method: 'pix' | 'card';
  status: 'pending' | 'approved' | 'rejected';
  pixQrCode?: string;
  pixCopyPaste?: string;
  transactionId: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  priceBrl: number;
  originalPriceBrl?: number;
  tag?: string;
  popular?: boolean;
}

export interface AdminMetrics {
  totalRevenueBrl: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalCreditsSold: number;
  activeThemesCount: number;
}
