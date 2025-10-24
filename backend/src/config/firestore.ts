import admin from './firebaseAdmin';

// Obter instância do Firestore
export const db = admin.firestore();

// Configurações do Firestore
db.settings({
  ignoreUndefinedProperties: true,
});

// Collections (coleções principais)
export const collections = {
  users: 'users',
  bills: 'bills',
  notifications: 'notifications',
} as const;

// Tipos para os documentos
export interface UserDocument {
  firebaseUid: string;
  email: string;
  username: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface BillDocument {
  id: string;
  userId: string;
  type: 'ELECTRICITY' | 'WATER' | 'GAS' | 'INTERNET' | 'PHONE' | 'OTHER';
  title: string;
  value: number;
  dueDate: FirebaseFirestore.Timestamp;
  barcode?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  isPaid: boolean;
  paidAt?: FirebaseFirestore.Timestamp;
  ocrData?: any;
  ocrConfidence?: number;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface ReminderDocument {
  id: string;
  billId: string;
  type: 'THREE_DAYS_BEFORE' | 'ONE_DAY_BEFORE' | 'DUE_DATE' | 'CUSTOM';
  reminderDate: FirebaseFirestore.Timestamp;
  sent: boolean;
  sentAt?: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface NotificationDocument {
  id: string;
  userId: string;
  billId?: string;
  title: string;
  message: string;
  read: boolean;
  sentAt: FirebaseFirestore.Timestamp;
  data?: any;
}

// Helper para converter Timestamp para Date
export const timestampToDate = (timestamp: FirebaseFirestore.Timestamp): Date => {
  return timestamp.toDate();
};

// Helper para converter Date para Timestamp
export const dateToTimestamp = (date: Date): FirebaseFirestore.Timestamp => {
  return admin.firestore.Timestamp.fromDate(date);
};

export default db;

