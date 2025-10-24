import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';

/**
 * Middleware para verificar token Firebase
 */
export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verificar token com Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Adicionar informações do usuário ao request
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error: any) {
    console.error('❌ Erro ao verificar token:', error);
    return res.status(401).json({ error: 'Token inválido', message: error.message });
  }
};

/**
 * Middleware opcional de autenticação (não bloqueia se não houver token)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      (req as any).user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    }

    next();
  } catch (error) {
    // Se houver erro, apenas continua sem autenticação
    next();
  }
};

