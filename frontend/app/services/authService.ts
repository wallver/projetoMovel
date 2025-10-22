import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

export interface UserData {
  uid: string;
  email: string;
  username: string;
  createdAt: Date;
}

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

// Obter usuário atual
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
