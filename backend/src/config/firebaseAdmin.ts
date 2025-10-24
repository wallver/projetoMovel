import admin from 'firebase-admin';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente ANTES de tudo
dotenv.config();

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  // Verificar se as credenciais existem
  if (process.env.FIREBASE_PROJECT_ID && 
      process.env.FIREBASE_PRIVATE_KEY && 
      process.env.FIREBASE_CLIENT_EMAIL) {
    
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      
      console.log('✅ Firebase Admin inicializado com sucesso');
      console.log(`📦 Projeto: ${process.env.FIREBASE_PROJECT_ID}`);
    } catch (error: any) {
      console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
      console.error('⚠️ Verifique suas credenciais no arquivo .env');
    }
  } else {
    console.warn('⚠️ Credenciais do Firebase não configuradas no .env');
    console.warn('   Verifique se o arquivo backend/.env existe e tem:');
    console.warn('   - FIREBASE_PROJECT_ID');
    console.warn('   - FIREBASE_PRIVATE_KEY');
    console.warn('   - FIREBASE_CLIENT_EMAIL');
    console.warn('   - FIREBASE_STORAGE_BUCKET');
  }
}

export default admin;
