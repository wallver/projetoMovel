import firestoreService from './firestoreService';
import axios from 'axios';

interface PushNotification {
  to: string; // Expo push token
  title: string;
  body: string;
  data?: any;
  sound?: string;
  badge?: number;
}

/**
 * Service para envio de notificações push (Firestore)
 */
class NotificationService {
  private expoPushUrl = 'https://exp.host/--/api/v2/push/send';

  /**
   * Envia notificação push via Expo
   */
  async sendPushNotification(notification: PushNotification): Promise<boolean> {
    try {
      const message = {
        to: notification.to,
        sound: notification.sound || 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        badge: notification.badge,
        priority: 'high',
      };

      const response = await axios.post(this.expoPushUrl, message, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });

      if (response.data.data && response.data.data.status === 'ok') {
        console.log('✅ Notificação enviada com sucesso');
        return true;
      } else {
        console.error('❌ Erro ao enviar notificação:', response.data);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro ao enviar push notification:', error);
      return false;
    }
  }

  /**
   * Cria registro de notificação no banco de dados
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    billId?: string,
    data?: any
  ): Promise<void> {
    await firestoreService.createNotification({
      userId,
      billId,
      title,
      message,
      read: false,
      data: data || {},
    });
  }

  /**
   * Busca notificações de um usuário
   */
  async getUserNotifications(userId: string, limit: number = 50): Promise<any[]> {
    return await firestoreService.getUserNotifications(userId, limit);
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(notificationId: string): Promise<void> {
    await firestoreService.markNotificationAsRead(notificationId);
  }

  /**
   * Marca todas as notificações de um usuário como lidas
   */
  async markAllAsRead(userId: string): Promise<void> {
    await firestoreService.markAllNotificationsAsRead(userId);
  }

  /**
   * Conta notificações não lidas
   */
  async countUnread(userId: string): Promise<number> {
    return await firestoreService.countUnreadNotifications(userId);
  }

  /**
   * Gera mensagem de lembrete baseado no tipo
   */
  generateReminderMessage(billType: string, value: number, dueDate: Date, reminderType: string): { title: string; body: string } {
    const billTypeNames: { [key: string]: string } = {
      ELECTRICITY: 'Conta de Luz',
      WATER: 'Conta de Água',
      GAS: 'Conta de Gás',
      INTERNET: 'Conta de Internet',
      PHONE: 'Conta de Telefone',
      OTHER: 'Conta',
    };

    const typeName = billTypeNames[billType] || 'Conta';
    const valueFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

    const dueDateFormatted = new Intl.DateTimeFormat('pt-BR').format(dueDate);

    let title = '';
    let body = '';

    switch (reminderType) {
      case 'THREE_DAYS_BEFORE':
        title = `⚠️ ${typeName} vence em 3 dias`;
        body = `${typeName} no valor de ${valueFormatted} vence em ${dueDateFormatted}`;
        break;
      case 'ONE_DAY_BEFORE':
        title = `🔔 ${typeName} vence amanhã`;
        body = `Não esqueça! ${typeName} de ${valueFormatted} vence amanhã (${dueDateFormatted})`;
        break;
      case 'DUE_DATE':
        title = `🚨 ${typeName} vence HOJE`;
        body = `ATENÇÃO! ${typeName} de ${valueFormatted} vence hoje!`;
        break;
      default:
        title = `Lembrete: ${typeName}`;
        body = `${typeName} de ${valueFormatted} vence em ${dueDateFormatted}`;
    }

    return { title, body };
  }
}

export default new NotificationService();

