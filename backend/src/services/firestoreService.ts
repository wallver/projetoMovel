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
    try {
      console.log('🔍 Buscando contas para userId:', userId);
      console.log('📋 Filtros:', filters);

      let query: FirebaseFirestore.Query = db
        .collection(collections.bills)
        .where('userId', '==', userId);

      // Não filtrar por status OVERDUE na query, vamos verificar em tempo real
      if (filters?.status && filters.status !== 'OVERDUE') {
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

      // Tentar ordenar por dueDate, mas se falhar, ordenar em memória
      try {
        query = query.orderBy('dueDate', 'asc');
      } catch (error) {
        console.warn('⚠️ Não foi possível usar orderBy no Firestore, ordenando em memória');
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const snapshot = await query.get();
      console.log(`✅ Encontradas ${snapshot.docs.length} contas`);

      let bills = snapshot.docs.map(doc => doc.data() as BillDocument);

      // Verificar e atualizar contas vencidas em tempo real
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Resetar horas para comparação correta
      const nowTimestamp = dateToTimestamp(now);
      const billsToUpdate: { docId: string; bill: BillDocument }[] = [];

      bills = bills.map(bill => {
        try {
          const dueDate = timestampToDate(bill.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const dueDateTimestamp = dateToTimestamp(dueDate);

          // Se a conta está PENDING e vencida, marcar como OVERDUE
          if (bill.status === 'PENDING' && dueDateTimestamp < nowTimestamp) {
            console.log(`🔄 Conta ${bill.id} está vencida, atualizando status para OVERDUE`);
            billsToUpdate.push({ docId: bill.id, bill });
            return { ...bill, status: 'OVERDUE' as const };
          }
          return bill;
        } catch (error) {
          console.error('Erro ao verificar data de vencimento:', error);
          return bill;
        }
      });

      // Atualizar contas vencidas no banco (em batch para performance)
      if (billsToUpdate.length > 0) {
        try {
          const batch = db.batch();
          billsToUpdate.forEach(({ docId }) => {
            const billRef = db.collection(collections.bills).doc(docId);
            batch.update(billRef, {
              status: 'OVERDUE',
              updatedAt: dateToTimestamp(new Date()),
            });
          });
          await batch.commit();
          console.log(`✅ ${billsToUpdate.length} conta(s) atualizada(s) para OVERDUE`);
        } catch (error) {
          console.error('Erro ao atualizar contas vencidas:', error);
        }
      }

      // Filtrar por status OVERDUE se necessário (após atualizar)
      if (filters?.status === 'OVERDUE') {
        bills = bills.filter(bill => bill.status === 'OVERDUE');
      }

      // Se orderBy falhou, ordenar em memória
      if (bills.length > 0 && bills[0].dueDate) {
        bills = bills.sort((a, b) => {
          try {
            const dateA = timestampToDate(a.dueDate);
            const dateB = timestampToDate(b.dueDate);
            return dateA.getTime() - dateB.getTime();
          } catch (error) {
            return 0;
          }
        });
      }

      return bills;
    } catch (error: any) {
      console.error('❌ Erro ao listar contas:', error);
      // Se o erro for relacionado a índice, tentar sem orderBy
      if (error.code === 9 || error.message?.includes('index')) {
        console.log('🔄 Tentando buscar sem orderBy devido a erro de índice...');
        try {
          let query: FirebaseFirestore.Query = db
            .collection(collections.bills)
            .where('userId', '==', userId);

          if (filters?.status) {
            query = query.where('status', '==', filters.status);
          }

          if (filters?.type) {
            query = query.where('type', '==', filters.type);
          }

          if (filters?.limit) {
            query = query.limit(filters.limit);
          }

          const snapshot = await query.get();
          let bills = snapshot.docs.map(doc => doc.data() as BillDocument);

          // Ordenar em memória
          bills = bills.sort((a, b) => {
            try {
              const dateA = timestampToDate(a.dueDate);
              const dateB = timestampToDate(b.dueDate);
              return dateA.getTime() - dateB.getTime();
            } catch (error) {
              return 0;
            }
          });

          return bills;
        } catch (retryError) {
          console.error('❌ Erro ao tentar novamente:', retryError);
          return [];
        }
      }
      return [];
    }
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
    try {
      // Buscar todas as contas (sem filtro de status para contar corretamente)
      const allBills = await this.listBills(userId, { limit: 1000 });
      
      // Verificar contas vencidas em tempo real para estatísticas
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const nowTimestamp = dateToTimestamp(now);

      const billsWithCorrectStatus = allBills.map(bill => {
        try {
          const dueDate = timestampToDate(bill.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          const dueDateTimestamp = dateToTimestamp(dueDate);

          // Se está PENDING e vencida, considerar como OVERDUE para estatísticas
          if (bill.status === 'PENDING' && dueDateTimestamp < nowTimestamp) {
            return { ...bill, status: 'OVERDUE' as const };
          }
          return bill;
        } catch (error) {
          return bill;
        }
      });
      
      const stats = {
        total: billsWithCorrectStatus.length || 0,
        pending: billsWithCorrectStatus.filter(b => b.status === 'PENDING').length || 0,
        paid: billsWithCorrectStatus.filter(b => b.status === 'PAID').length || 0,
        overdue: billsWithCorrectStatus.filter(b => b.status === 'OVERDUE').length || 0,
        // Total a pagar inclui PENDING e OVERDUE (ambas precisam ser pagas)
        totalPendingValue: billsWithCorrectStatus
          .filter(b => b.status === 'PENDING' || b.status === 'OVERDUE')
          .reduce((sum, b) => {
            const value = typeof b.value === 'number' ? b.value : 0;
            return sum + (isNaN(value) ? 0 : value);
          }, 0),
        upcomingBills: billsWithCorrectStatus
          .filter(b => {
            try {
              const dueDate = timestampToDate(b.dueDate);
              const now = new Date();
              const thirtyDaysFromNow = new Date();
              thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
              return b.status === 'PENDING' && dueDate >= now && dueDate <= thirtyDaysFromNow;
            } catch (error) {
              return false;
            }
          })
          .sort((a, b) => {
            try {
              return timestampToDate(a.dueDate).getTime() - timestampToDate(b.dueDate).getTime();
            } catch (error) {
              return 0;
            }
          })
          .slice(0, 5),
      };

      return stats;
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      // Retornar valores padrão em caso de erro
      return {
        total: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalPendingValue: 0,
        upcomingBills: [],
      };
    }
  }
}

export default new FirestoreService();

