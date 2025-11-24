/**
 * Script de debug para verificar contas no Firestore
 * Execute: npx ts-node src/utils/debugBills.ts
 */

import { db, collections } from '../config/firestore';

async function debugBills() {
  try {
    console.log('🔍 Buscando todas as contas no Firestore...\n');

    // Buscar todas as contas
    const snapshot = await db.collection(collections.bills).get();
    
    console.log(`📊 Total de contas encontradas: ${snapshot.docs.length}\n`);

    if (snapshot.docs.length === 0) {
      console.log('⚠️ Nenhuma conta encontrada no Firestore');
      return;
    }

    // Agrupar por userId
    const billsByUser: { [userId: string]: any[] } = {};

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const userId = data.userId || 'SEM_USER_ID';
      
      if (!billsByUser[userId]) {
        billsByUser[userId] = [];
      }
      
      billsByUser[userId].push({
        id: doc.id,
        title: data.title,
        status: data.status,
        value: data.value,
        userId: data.userId,
        dueDate: data.dueDate,
      });
    });

    console.log('📋 Contas agrupadas por userId:\n');
    
    Object.entries(billsByUser).forEach(([userId, bills]) => {
      console.log(`👤 userId: ${userId}`);
      console.log(`   Total de contas: ${bills.length}`);
      bills.forEach(bill => {
        console.log(`   - ${bill.title} (${bill.status}) - R$ ${bill.value}`);
      });
      console.log('');
    });

    // Verificar se há contas sem userId
    const billsWithoutUserId = snapshot.docs.filter(doc => !doc.data().userId);
    if (billsWithoutUserId.length > 0) {
      console.log(`⚠️ ATENÇÃO: ${billsWithoutUserId.length} conta(s) sem userId!`);
    }

  } catch (error) {
    console.error('❌ Erro ao buscar contas:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  debugBills()
    .then(() => {
      console.log('\n✅ Debug concluído');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro:', error);
      process.exit(1);
    });
}

export { debugBills };

