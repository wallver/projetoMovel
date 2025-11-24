import { Request, Response } from 'express';
import firestoreService from '../services/firestoreService';
import ocrService from '../services/ocrService';
import reminderService from '../services/reminderService';
import { dateToTimestamp, serializeDoc } from '../config/firestore';
import { getStorage } from 'firebase-admin/storage';

/**
 * Controller para gerenciamento de contas (Firestore)
 */
class BillController {
  /**
   * Upload e processamento de imagem de conta
   */
  async uploadBill(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'userId é obrigatório' });
      }

      // Verificar se usuário existe
      const user = await firestoreService.getUserByFirebaseUid(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Processar imagem com OCR
      console.log('📸 Processando imagem com OCR...');
      const ocrResult = await ocrService.processImage(file.buffer);
      
      // Identificar tipo de conta
      const billType = ocrService.identifyBillType(ocrResult.fullText);

      // Upload da imagem para Firebase Storage
      const bucket = getStorage().bucket();
      const filename = `bills/${userId}/${Date.now()}_${file.originalname}`;
      const fileUpload = bucket.file(filename);

      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      // Tornar arquivo público
      await fileUpload.makePublic();
      const imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

      // Criar título baseado no tipo e data
      const month = ocrResult.detectedData.dueDate 
        ? new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(ocrResult.detectedData.dueDate)
        : new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());
      
      const billTypeNames: { [key: string]: string } = {
        ELECTRICITY: 'Conta de Luz',
        WATER: 'Conta de Água',
        GAS: 'Conta de Gás',
        INTERNET: 'Internet',
        PHONE: 'Telefone',
        OTHER: 'Conta',
      };
      const title = `${billTypeNames[billType]} - ${month.charAt(0).toUpperCase() + month.slice(1)}`;

      // Criar conta no Firestore
      const bill = await firestoreService.createBill({
        userId,
        type: billType as any,
        title,
        value: ocrResult.detectedData.value || 0,
        dueDate: dateToTimestamp(ocrResult.detectedData.dueDate || new Date()),
        barcode: ocrResult.detectedData.barcode,
        pixCode: ocrResult.detectedData.pixCode, // Adicionar código Pix
        imageUrl,
        ocrData: ocrResult,
        ocrConfidence: ocrResult.confidence,
        status: 'PENDING',
        isPaid: false,
      });

      // Criar lembretes automáticos
      if (ocrResult.detectedData.dueDate) {
        await reminderService.createRemindersForBill(bill.id, ocrResult.detectedData.dueDate);
      }

      console.log('✅ Conta criada com sucesso:', bill.id);

      return res.status(201).json({
        success: true,
        message: 'Conta processada com sucesso',
        bill: serializeDoc({
          ...bill,
          needsReview: !ocrResult.detectedData.value || !ocrResult.detectedData.dueDate,
        }),
        ocrResult: {
          confidence: ocrResult.confidence,
          detectedData: ocrResult.detectedData,
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao processar conta:', error);
      return res.status(500).json({ 
        error: 'Erro ao processar conta',
        message: error.message 
      });
    }
  }

  /**
   * Listar contas do usuário
   */
  async listBills(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, type, startDate, endDate, limit = 50 } = req.query;

      console.log('📋 Listando contas para userId:', userId);
      console.log('🔍 Query params:', { status, type, startDate, endDate, limit });

      const filters: any = { limit: Number(limit) };
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const bills = await firestoreService.listBills(userId, filters);

      console.log(`✅ Retornando ${bills.length} contas`);

      return res.json({
        success: true,
        bills: bills.map(bill => serializeDoc(bill)),
        pagination: {
          total: bills.length,
          limit: Number(limit),
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar contas:', error);
      return res.status(500).json({ error: 'Erro ao listar contas', message: error.message });
    }
  }

  /**
   * Buscar conta por ID
   */
  async getBill(req: Request, res: Response) {
    try {
      const { billId } = req.params;

      const bill = await firestoreService.getBillById(billId);

      if (!bill) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      return res.json({ success: true, bill: serializeDoc(bill) });
    } catch (error: any) {
      console.error('❌ Erro ao buscar conta:', error);
      return res.status(500).json({ error: 'Erro ao buscar conta', message: error.message });
    }
  }

  /**
   * Atualizar conta
   */
  async updateBill(req: Request, res: Response) {
    try {
      const { billId } = req.params;
      const { title, value, dueDate, type, status, notes, barcode } = req.body;

      const existingBill = await firestoreService.getBillById(billId);
      if (!existingBill) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (value !== undefined) updateData.value = parseFloat(value);
      if (type !== undefined) updateData.type = type;
      if (status !== undefined) updateData.status = status;
      if (notes !== undefined) updateData.notes = notes;
      if (barcode !== undefined) updateData.barcode = barcode;
      
      if (dueDate !== undefined) {
        try {
          updateData.dueDate = dateToTimestamp(dueDate);
          
          // Atualizar lembretes se a data mudou
          const dueDateObj = new Date(dueDate);
          await reminderService.updateRemindersForBill(billId, dueDateObj);
        } catch (error: any) {
          console.error('Erro ao processar data de vencimento:', error);
          return res.status(400).json({ 
            error: 'Data de vencimento inválida',
            message: error.message 
          });
        }
      }

      await firestoreService.updateBill(billId, updateData);

      return res.json({ success: true, message: 'Conta atualizada com sucesso' });
    } catch (error: any) {
      console.error('❌ Erro ao atualizar conta:', error);
      return res.status(500).json({ error: 'Erro ao atualizar conta', message: error.message });
    }
  }

  /**
   * Marcar conta como paga
   */
  async markAsPaid(req: Request, res: Response) {
    try {
      const { billId } = req.params;

      await firestoreService.updateBill(billId, {
        status: 'PAID',
        isPaid: true,
        paidAt: dateToTimestamp(new Date()),
      });

      return res.json({ success: true, message: 'Conta marcada como paga' });
    } catch (error: any) {
      console.error('❌ Erro ao marcar conta como paga:', error);
      return res.status(500).json({ error: 'Erro ao marcar conta como paga', message: error.message });
    }
  }

  /**
   * Deletar conta
   */
  async deleteBill(req: Request, res: Response) {
    try {
      const { billId } = req.params;

      await firestoreService.deleteBill(billId);

      return res.json({ success: true, message: 'Conta deletada com sucesso' });
    } catch (error: any) {
      console.error('❌ Erro ao deletar conta:', error);
      return res.status(500).json({ error: 'Erro ao deletar conta', message: error.message });
    }
  }

  /**
   * Estatísticas de contas do usuário
   */
  async getStats(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const stats = await firestoreService.getUserStats(userId);

      return res.json({
        success: true,
        stats: {
          ...stats,
          upcomingBills: stats.upcomingBills ? stats.upcomingBills.map((bill: any) => serializeDoc(bill)) : [],
        },
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(500).json({ error: 'Erro ao buscar estatísticas', message: error.message });
    }
  }
}

export default new BillController();
