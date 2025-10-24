import cron from 'node-cron';
import reminderService from '../services/reminderService';
import notificationService from '../services/notificationService';
import firestoreService from '../services/firestoreService';
import { timestampToDate } from '../config/firestore';

/**
 * Cron job para verificar e enviar lembretes pendentes
 * Executa a cada 15 minutos
 */
const checkReminders = async () => {
  try {
    console.log('⏰ Verificando lembretes pendentes...');

    // Buscar lembretes pendentes
    const pendingReminders = await reminderService.getPendingReminders();

    if (pendingReminders.length === 0) {
      console.log('✅ Nenhum lembrete pendente');
      return;
    }

    console.log(`📬 ${pendingReminders.length} lembrete(s) para enviar`);

    for (const item of pendingReminders) {
      try {
        const { bill, reminder, billId } = item;
        
        if (!bill) {
          console.warn(`⚠️ Lembrete ${reminder.id} sem conta associada`);
          continue;
        }

        // Buscar usuário
        const user = await firestoreService.getUserByFirebaseUid(bill.userId);
        if (!user) {
          console.warn(`⚠️ Usuário ${bill.userId} não encontrado`);
          continue;
        }

        // Gerar mensagem do lembrete
        const { title, body } = notificationService.generateReminderMessage(
          bill.type,
          bill.value,
          timestampToDate(bill.dueDate),
          reminder.type
        );

        // Criar notificação no banco
        await notificationService.createNotification(
          user.firebaseUid,
          title,
          body,
          bill.id,
          {
            billId: bill.id,
            type: reminder.type,
          }
        );

        // TODO: Enviar push notification
        // Para enviar push notification, precisamos armazenar o Expo Push Token do usuário
        // Isso será implementado no frontend

        // Marcar lembrete como enviado
        await reminderService.markReminderAsSent(billId, reminder.id);

        console.log(`✅ Lembrete enviado: ${bill.title} - ${title}`);
      } catch (error) {
        console.error(`❌ Erro ao processar lembrete:`, error);
      }
    }

    console.log('✅ Verificação de lembretes concluída');
  } catch (error) {
    console.error('❌ Erro ao verificar lembretes:', error);
  }
};

/**
 * Cron job para atualizar status de contas vencidas
 * Executa todo dia à meia-noite
 */
const updateOverdueBills = async () => {
  try {
    console.log('🔄 Atualizando status de contas vencidas...');

    const count = await firestoreService.updateOverdueBills();

    console.log(`✅ ${count} conta(s) marcada(s) como vencida(s)`);
  } catch (error) {
    console.error('❌ Erro ao atualizar contas vencidas:', error);
  }
};

// Agendar jobs
console.log('📅 Agendando cron jobs...');

// Verificar lembretes a cada 15 minutos
cron.schedule('*/15 * * * *', checkReminders);
console.log('✅ Job de lembretes agendado (a cada 15 minutos)');

// Atualizar contas vencidas todo dia à meia-noite
cron.schedule('0 0 * * *', updateOverdueBills);
console.log('✅ Job de atualização de status agendado (todo dia à meia-noite)');

// Executar verificação inicial
setTimeout(() => {
  checkReminders();
  updateOverdueBills();
}, 5000); // Aguardar 5 segundos após inicialização

export { checkReminders, updateOverdueBills };

