import { db, collections, dateToTimestamp, timestampToDate } from '../config/firestore';
import type { BillDocument, ReminderDocument, NotificationDocument, UserDocument } from '../config/firestore';

/**
 * Service genérico para operações no Firestore
 */
class FirestoreService {
  /**
   * Criar ou atualizar usuário
   */
  async syncUser(firebaseUid: string, email: string, username: string): Promise<UserDocument> {
    const userRef = db.collection(collections.users).doc(firebaseUid);
    const userDoc = await userRef.get();

    const userData: UserDocument = {
      firebaseUid,
      email,
      username,
      createdAt: userDoc.exists ? userDoc.data()!.createdAt : dateToTimestamp(new Date()),
      updatedAt: dateToTimestamp(new Date()),
    };

    await userRef.set(userData, { merge: true });
    return userData;
  }

  /**
   * Buscar usuário por firebaseUid
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<UserDocument | null> {
    const userDoc = await db.collection(collections.users).doc(firebaseUid).get();
    return userDoc.exists ? (userDoc.data() as UserDocument) : null;
  }

  /**
   * Criar conta
   */
  async createBill(billData: Omit<BillDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillDocument> {
    const billRef = db.collection(collections.bills).doc();
    
    const bill: BillDocument = {
      ...billData,
      id: billRef.id,
      createdAt: dateToTimestamp(new Date()),
      updatedAt: dateToTimestamp(new Date()),
    };

    await billRef.set(bill);
    return bill;
  }

  /**
   * Listar contas do usuário
   */
  async listBills(
    userId: string,
    filters?: {
      status?: string;
      type?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<BillDocument[]> {
    let query: FirebaseFirestore.Query = db
      .collection(collections.bills)
      .where('userId', '==', userId);

    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }

    if (filters?.type) {
      query = query.where('type', '==', filters.type);
    }

    if (filters?.startDate) {
      query = query.where('dueDate', '>=', dateToTimestamp(filters.startDate));
    }

    if (filters?.endDate) {
      query = query.where('dueDate', '<=', dateToTimestamp(filters.endDate));
    }

    query = query.orderBy('dueDate', 'asc');

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data() as BillDocument);
  }

  /**
   * Buscar conta por ID
   */
  async getBillById(billId: string): Promise<BillDocument | null> {
    const billDoc = await db.collection(collections.bills).doc(billId).get();
    return billDoc.exists ? (billDoc.data() as BillDocument) : null;
  }

  /**
   * Atualizar conta
   */
  async updateBill(billId: string, updates: Partial<BillDocument>): Promise<void> {
    await db.collection(collections.bills).doc(billId).update({
      ...updates,
      updatedAt: dateToTimestamp(new Date()),
    });
  }

  /**
   * Deletar conta
   */
  async deleteBill(billId: string): Promise<void> {
    // Deletar reminders da conta
    const remindersSnapshot = await db
      .collection(collections.bills)
      .doc(billId)
      .collection('reminders')
      .get();

    const batch = db.batch();
    remindersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // Deletar a conta
    await db.collection(collections.bills).doc(billId).delete();
  }

  /**
   * Criar reminder
   */
  async createReminder(billId: string, reminderData: Omit<ReminderDocument, 'id' | 'createdAt'>): Promise<ReminderDocument> {
    const reminderRef = db
      .collection(collections.bills)
      .doc(billId)
      .collection('reminders')
      .doc();

    const reminder: ReminderDocument = {
      ...reminderData,
      id: reminderRef.id,
      createdAt: dateToTimestamp(new Date()),
    };

    await reminderRef.set(reminder);
    return reminder;
  }

  /**
   * Buscar reminders pendentes
   */
  async getPendingReminders(): Promise<Array<{ billId: string; reminder: ReminderDocument; bill: BillDocument }>> {
    const now = dateToTimestamp(new Date());
    const results: Array<{ billId: string; reminder: ReminderDocument; bill: BillDocument }> = [];

    // Buscar todas as contas
    const billsSnapshot = await db.collection(collections.bills).get();

    for (const billDoc of billsSnapshot.docs) {
      const bill = billDoc.data() as BillDocument;
      
      // Buscar reminders não enviados dessa conta
      const remindersSnapshot = await billDoc.ref
        .collection('reminders')
        .where('sent', '==', false)
        .where('reminderDate', '<=', now)
        .get();

      remindersSnapshot.docs.forEach(reminderDoc => {
        results.push({
          billId: billDoc.id,
          reminder: reminderDoc.data() as ReminderDocument,
          bill,
        });
      });
    }

    return results;
  }

  /**
   * Marcar reminder como enviado
   */
  async markReminderAsSent(billId: string, reminderId: string): Promise<void> {
    await db
      .collection(collections.bills)
      .doc(billId)
      .collection('reminders')
      .doc(reminderId)
      .update({
        sent: true,
        sentAt: dateToTimestamp(new Date()),
      });
  }

  /**
   * Deletar reminders de uma conta
   */
  async deleteRemindersForBill(billId: string): Promise<void> {
    const remindersSnapshot = await db
      .collection(collections.bills)
      .doc(billId)
      .collection('reminders')
      .get();

    const batch = db.batch();
    remindersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  /**
   * Criar notificação
   */
  async createNotification(notificationData: Omit<NotificationDocument, 'id'>): Promise<NotificationDocument> {
    const notificationRef = db.collection(collections.notifications).doc();

    const notification: NotificationDocument = {
      ...notificationData,
      id: notificationRef.id,
      sentAt: dateToTimestamp(new Date()),
    };

    await notificationRef.set(notification);
    return notification;
  }

  /**
   * Listar notificações do usuário
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<NotificationDocument[]> {
    const snapshot = await db
      .collection(collections.notifications)
      .where('userId', '==', userId)
      .orderBy('sentAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as NotificationDocument);
  }

  /**
   * Marcar notificação como lida
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db.collection(collections.notifications).doc(notificationId).update({
      read: true,
    });
  }

  /**
   * Marcar todas notificações como lidas
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const snapshot = await db
      .collection(collections.notifications)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.update(doc.ref, { read: true }));
    await batch.commit();
  }

  /**
   * Contar notificações não lidas
   */
  async countUnreadNotifications(userId: string): Promise<number> {
    const snapshot = await db
      .collection(collections.notifications)
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    return snapshot.size;
  }

  /**
   * Atualizar contas vencidas
   */
  async updateOverdueBills(): Promise<number> {
    const now = dateToTimestamp(new Date());
    
    const snapshot = await db
      .collection(collections.bills)
      .where('status', '==', 'PENDING')
      .where('dueDate', '<', now)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { 
        status: 'OVERDUE',
        updatedAt: dateToTimestamp(new Date()),
      });
    });

    await batch.commit();
    return snapshot.size;
  }

  /**
   * Estatísticas do usuário
   */
  async getUserStats(userId: string): Promise<any> {
    const allBills = await this.listBills(userId);
    
    const stats = {
      total: allBills.length,
      pending: allBills.filter(b => b.status === 'PENDING').length,
      paid: allBills.filter(b => b.status === 'PAID').length,
      overdue: allBills.filter(b => b.status === 'OVERDUE').length,
      totalPendingValue: allBills
        .filter(b => b.status === 'PENDING')
        .reduce((sum, b) => sum + b.value, 0),
      upcomingBills: allBills
        .filter(b => {
          const dueDate = timestampToDate(b.dueDate);
          const now = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          return b.status === 'PENDING' && dueDate >= now && dueDate <= thirtyDaysFromNow;
        })
        .sort((a, b) => timestampToDate(a.dueDate).getTime() - timestampToDate(b.dueDate).getTime())
        .slice(0, 5),
    };

    return stats;
  }
}

export default new FirestoreService();

