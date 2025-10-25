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
  pixCode?: string;
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
export const dateToTimestamp = (date: Date | string | any): FirebaseFirestore.Timestamp => {
  // Se já é um Timestamp, retornar diretamente
  if (date && typeof date === 'object' && '_seconds' in date) {
    return admin.firestore.Timestamp.fromMillis(date._seconds * 1000 + (date._nanoseconds || 0) / 1000000);
  }
  
  // Se é uma string ou número, converter para Date primeiro
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Validar se a data é válida
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  return admin.firestore.Timestamp.fromDate(dateObj);
};

// Helper para serializar documento com Timestamps
export const serializeDoc = (doc: any): any => {
  if (!doc) return doc;
  
  const serialized: any = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value && typeof value === 'object' && 'toDate' in value) {
      // É um Timestamp do Firestore
      serialized[key] = (value as FirebaseFirestore.Timestamp).toDate().toISOString();
    } else if (value && typeof value === 'object' && '_seconds' in value) {
      // É um Timestamp serializado
      const timestamp = admin.firestore.Timestamp.fromMillis(
        value._seconds * 1000 + (value._nanoseconds || 0) / 1000000
      );
      serialized[key] = timestamp.toDate().toISOString();
    } else {
      serialized[key] = value;
    }
  }
  return serialized;
};

export default db;

