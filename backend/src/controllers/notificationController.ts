import { Request, Response } from 'express';
import notificationService from '../services/notificationService';

/**
 * Controller para gerenciamento de notificações
 */
class NotificationController {
  /**
   * Listar notificações do usuário
   */
  async listNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      const notifications = await notificationService.getUserNotifications(
        userId,
        Number(limit)
      );

      const unreadCount = await notificationService.countUnread(userId);

      return res.json({
        success: true,
        notifications,
        unreadCount,
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar notificações:', error);
      return res.status(500).json({ 
        error: 'Erro ao listar notificações',
        message: error.message 
      });
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;

      await notificationService.markAsRead(notificationId);

      return res.json({
        success: true,
        message: 'Notificação marcada como lida',
      });
    } catch (error: any) {
      console.error('❌ Erro ao marcar notificação:', error);
      return res.status(500).json({ 
        error: 'Erro ao marcar notificação',
        message: error.message 
      });
    }
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      await notificationService.markAllAsRead(userId);

      return res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas',
      });
    } catch (error: any) {
      console.error('❌ Erro ao marcar notificações:', error);
      return res.status(500).json({ 
        error: 'Erro ao marcar notificações',
        message: error.message 
      });
    }
  }

  /**
   * Contar notificações não lidas
   */
  async countUnread(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const count = await notificationService.countUnread(userId);

      return res.json({
        success: true,
        unreadCount: count,
      });
    } catch (error: any) {
      console.error('❌ Erro ao contar notificações:', error);
      return res.status(500).json({ 
        error: 'Erro ao contar notificações',
        message: error.message 
      });
    }
  }
}

export default new NotificationController();

