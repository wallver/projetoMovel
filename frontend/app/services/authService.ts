import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface UserData {
  uid: string;
  email: string;
  username: string;
  createdAt: Date;
}

// Sincronizar usuário com backend
const syncUserWithBackend = async (firebaseUid: string, email: string, username: string) => {
  try {
    await axios.post(`${API_URL}/users/sync`, {
      firebaseUid,
      email,
      username,
    }, {
      headers: {
        'ngrok-skip-browser-warning': 'true', // Pula o aviso do ngrok
      },
    });
    console.log('✅ Usuário sincronizado com backend');
  } catch (error) {
    console.error('⚠️ Erro ao sincronizar com backend:', error);
    // Não bloqueia o registro se falhar
  }
};

// Registrar novo usuário
export const registerUser = async (username: string, email: string, password: string) => {
  try {
    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar o displayName do usuário
    await updateProfile(user, {
      displayName: username
    });

    // Salvar dados adicionais no Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      username: username,
      email: email,
      createdAt: new Date().toISOString()
    });

    // Sincronizar com backend
    await syncUserWithBackend(user.uid, email, username);

    return {
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      user: {
        uid: user.uid,
        email: user.email,
        username: username
      }
    };
  } catch (error: any) {
    console.error('Erro no registro:', error);
    
    let message = 'Erro ao cadastrar usuário';
    if (error.code === 'auth/email-already-in-use') {
      message = 'Este email já está em uso';
    } else if (error.code === 'auth/weak-password') {
      message = 'A senha deve ter pelo menos 6 caracteres';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Email inválido';
    }

    return {
      success: false,
      message: message
    };
  }
};

// Login
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Buscar dados adicionais do Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    return {
      success: true,
      message: 'Login bem-sucedido!',
      user: {
        uid: user.uid,
        email: user.email,
        username: userData?.username || user.displayName || 'Usuário'
      }
    };
  } catch (error: any) {
    console.error('Erro no login:', error);
    
    let message = 'Erro ao fazer login';
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = 'Email ou senha inválidos';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Email inválido';
    } else if (error.code === 'auth/invalid-credential') {
      message = 'Credenciais inválidas';
    }

    return {
      success: false,
      message: message
    };
  }
};

// Recuperação de senha
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: `Email de recuperação enviado para ${email}`
    };
  } catch (error: any) {
    console.error('Erro na recuperação:', error);
    
    let message = 'Erro ao enviar email de recuperação';
    if (error.code === 'auth/user-not-found') {
      message = 'Email não encontrado';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Email inválido';
    }

    return {
      success: false,
      message: message
    };
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logout realizado com sucesso'
    };
  } catch (error: any) {
    console.error('Erro no logout:', error);
    return {
      success: false,
      message: 'Erro ao fazer logout'
    };
  }
};

// Obter usuário atual com dados do Firestore
export const getCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }

    // Buscar dados adicionais do Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        ...userDoc.data()
      };
    }

    // Se não encontrar no Firestore, retorna dados básicos do Auth
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
};

// Alterar senha do usuário logado
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      return {
        success: false,
        message: 'Usuário não está logado'
      };
    }

    // Re-autenticar usuário antes de alterar senha (requisito de segurança do Firebase)
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    try {
      await reauthenticateWithCredential(user, credential);
    } catch (reauthError: any) {
      console.error('Erro na re-autenticação:', reauthError);
      
      let message = 'Senha atual incorreta';
      if (reauthError.code === 'auth/wrong-password' || reauthError.code === 'auth/invalid-credential') {
        message = 'Senha atual incorreta';
      } else if (reauthError.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas. Tente novamente mais tarde';
      }
      
      return {
        success: false,
        message: message
      };
    }

    // Atualizar senha
    await updatePassword(user, newPassword);

    return {
      success: true,
      message: 'Senha alterada com sucesso!'
    };
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    
    let message = 'Erro ao alterar senha';
    if (error.code === 'auth/weak-password') {
      message = 'A nova senha deve ter pelo menos 6 caracteres';
    } else if (error.code === 'auth/requires-recent-login') {
      message = 'Por segurança, faça login novamente antes de alterar a senha';
    }

    return {
      success: false,
      message: message
    };
  }
};
