import firestoreService from './firestoreService';
import { dateToTimestamp } from '../config/firestore';

type ReminderType = 'THREE_DAYS_BEFORE' | 'ONE_DAY_BEFORE' | 'DUE_DATE' | 'CUSTOM';

/**
 * Service para gerenciamento de lembretes (Firestore)
 */
class ReminderService {
  /**
   * Cria lembretes automáticos para uma conta
   */
  async createRemindersForBill(billId: string, dueDate: Date): Promise<void> {
    const reminders = [];

    // Lembrete 3 dias antes
    const threeDaysBefore = new Date(dueDate);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
    threeDaysBefore.setHours(9, 0, 0, 0); // 9h da manhã
    
    if (threeDaysBefore > new Date()) {
      reminders.push({
        type: 'THREE_DAYS_BEFORE' as ReminderType,
        reminderDate: threeDaysBefore,
      });
    }

    // Lembrete 1 dia antes
    const oneDayBefore = new Date(dueDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(9, 0, 0, 0);
    
    if (oneDayBefore > new Date()) {
      reminders.push({
        type: 'ONE_DAY_BEFORE' as ReminderType,
        reminderDate: oneDayBefore,
      });
    }

    // Lembrete no dia do vencimento
    const dueDateReminder = new Date(dueDate);
    dueDateReminder.setHours(9, 0, 0, 0);
    
    if (dueDateReminder > new Date()) {
      reminders.push({
        type: 'DUE_DATE' as ReminderType,
        reminderDate: dueDateReminder,
      });
    }

    // Criar todos os lembretes
    for (const reminder of reminders) {
      await firestoreService.createReminder(billId, {
        billId,
        type: reminder.type,
        reminderDate: dateToTimestamp(reminder.reminderDate),
        sent: false,
      });
    }
  }

  /**
   * Busca lembretes pendentes que devem ser enviados
   */
  async getPendingReminders(): Promise<any[]> {
    return await firestoreService.getPendingReminders();
  }

  /**
   * Marca um lembrete como enviado
   */
  async markReminderAsSent(billId: string, reminderId: string): Promise<void> {
    await firestoreService.markReminderAsSent(billId, reminderId);
  }

  /**
   * Atualiza lembretes quando a data de vencimento é alterada
   */
  async updateRemindersForBill(billId: string, newDueDate: Date): Promise<void> {
    // Remover lembretes antigos não enviados
    await firestoreService.deleteRemindersForBill(billId);

    // Criar novos lembretes
    await this.createRemindersForBill(billId, newDueDate);
  }

  /**
   * Remove todos os lembretes de uma conta
   */
  async deleteRemindersForBill(billId: string): Promise<void> {
    await firestoreService.deleteRemindersForBill(billId);
  }
}

export default new ReminderService();

