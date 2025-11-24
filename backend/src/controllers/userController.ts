import { Request, Response } from 'express';
import firestoreService from '../services/firestoreService';

/**
 * Controller para gerenciamento de usuários (Firestore)
 */
class UserController {
  /**
   * Criar ou sincronizar usuário do Firebase
   */
  async syncUser(req: Request, res: Response) {
    try {
      const { firebaseUid, email, username } = req.body;

      if (!firebaseUid || !email) {
        return res.status(400).json({ error: 'firebaseUid e email são obrigatórios' });
      }

      const user = await firestoreService.syncUser(
        firebaseUid,
        email,
        username || email.split('@')[0]
      );

      return res.json({
        success: true,
        message: 'Usuário sincronizado com sucesso',
        user,
      });
    } catch (error: any) {
      console.error('❌ Erro ao sincronizar usuário:', error);
      return res.status(500).json({ 
        error: 'Erro ao sincronizar usuário',
        message: error.message 
      });
    }
  }

  /**
   * Buscar perfil do usuário
   */
  async getProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const user = await firestoreService.getUserByFirebaseUid(userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Buscar contagens
      const bills = await firestoreService.listBills(userId);
      const notifications = await firestoreService.getUserNotifications(userId);

      return res.json({ 
        success: true, 
        user,
        _count: {
          bills: bills.length,
          notifications: notifications.length,
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar perfil:', error);
      return res.status(500).json({ error: 'Erro ao buscar perfil', message: error.message });
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { username, email } = req.body;

      const user = await firestoreService.getUserByFirebaseUid(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Usar email fornecido ou manter o atual
      const updatedEmail = email || user.email;
      // Usar username fornecido ou manter o atual
      const updatedUsername = username || user.username;

      await firestoreService.syncUser(userId, updatedEmail, updatedUsername);

      return res.json({ 
        success: true, 
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return res.status(500).json({ error: 'Erro ao atualizar perfil', message: error.message });
    }
  }

  /**
   * Deletar conta do usuário
   */
  async deleteAccount(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Deletar todas as contas do usuário
      const bills = await firestoreService.listBills(userId);
      for (const bill of bills) {
        await firestoreService.deleteBill(bill.id);
      }

      // Deletar usuário (implementar se necessário)
      // await db.collection('users').doc(userId).delete();

      return res.json({ 
        success: true, 
        message: 'Conta deletada com sucesso' 
      });
    } catch (error: any) {
      console.error('❌ Erro ao deletar conta:', error);
      return res.status(500).json({ error: 'Erro ao deletar conta', message: error.message });
    }
  }
}

export default new UserController();
