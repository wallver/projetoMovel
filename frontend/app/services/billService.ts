import axios from 'axios';
import { auth } from '../utils/firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Interface para dados de conta
 */
export interface Bill {
  id: string;
  userId: string;
  type: 'ELECTRICITY' | 'WATER' | 'GAS' | 'INTERNET' | 'PHONE' | 'OTHER';
  title: string;
  value: number;
  dueDate: string;
  barcode?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  notes?: string;
  isPaid: boolean;
  paidAt?: string;
  ocrData?: any;
  ocrConfidence?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Obter token de autenticação
 */
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  return await user.getIdToken();
};

/**
 * Headers padrão para requisições (inclui bypass do aviso do ngrok)
 */
const getDefaultHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'ngrok-skip-browser-warning': 'true', // Pula o aviso do ngrok
  };
};

/**
 * Upload e processamento de conta
 */
export const uploadBill = async (imageUri: string, userId: string) => {
  try {
    const token = await getAuthToken();

    // Criar FormData
    const formData = new FormData();
    
    // Adicionar imagem
    const filename = imageUri.split('/').pop() || 'bill.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    formData.append('userId', userId);

    const response = await axios.post(`${API_URL}/bills/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'ngrok-skip-browser-warning': 'true', // Pula o aviso do ngrok
      },
      timeout: 120000, // 2 minutos (para imagens grandes e OCR)
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao fazer upload da conta:', error);
    throw error.response?.data || error;
  }
};

/**
 * Listar contas do usuário
 */
export const listBills = async (
  userId: string,
  filters?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) => {
  try {
    const headers = await getDefaultHeaders();

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }

    const response = await axios.get(`${API_URL}/bills/${userId}?${params}`, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao listar contas:', error);
    throw error.response?.data || error;
  }
};

/**
 * Buscar conta por ID
 */
export const getBill = async (billId: string) => {
  try {
    const headers = await getDefaultHeaders();

    const response = await axios.get(`${API_URL}/bills/detail/${billId}`, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar conta:', error);
    throw error.response?.data || error;
  }
};

/**
 * Atualizar conta
 */
export const updateBill = async (
  billId: string,
  data: Partial<Bill>
) => {
  try {
    const headers = await getDefaultHeaders();

    const response = await axios.put(`${API_URL}/bills/${billId}`, data, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar conta:', error);
    throw error.response?.data || error;
  }
};

/**
 * Marcar conta como paga
 */
export const markBillAsPaid = async (billId: string) => {
  try {
    const headers = await getDefaultHeaders();

    const response = await axios.post(`${API_URL}/bills/${billId}/pay`, {}, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao marcar conta como paga:', error);
    throw error.response?.data || error;
  }
};

/**
 * Deletar conta
 */
export const deleteBill = async (billId: string) => {
  try {
    const headers = await getDefaultHeaders();

    const response = await axios.delete(`${API_URL}/bills/${billId}`, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao deletar conta:', error);
    throw error.response?.data || error;
  }
};

/**
 * Buscar estatísticas do usuário
 */
export const getUserStats = async (userId: string) => {
  try {
    const headers = await getDefaultHeaders();

    const response = await axios.get(`${API_URL}/bills/${userId}/stats`, {
      headers,
    });

    // Garantir que a resposta tenha o formato esperado
    if (response.data && response.data.success && response.data.stats) {
      return response.data;
    }
    
    // Se não tiver o formato esperado, retornar estrutura padrão
    return {
      success: true,
      stats: {
        total: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalPendingValue: 0,
      },
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    // Retornar estrutura padrão em caso de erro ao invés de lançar exceção
    return {
      success: false,
      stats: {
        total: 0,
        pending: 0,
        paid: 0,
        overdue: 0,
        totalPendingValue: 0,
      },
    };
  }
};

/**
 * Nomes dos tipos de conta em português
 */
export const getBillTypeName = (type: string): string => {
  const names: { [key: string]: string } = {
    ELECTRICITY: 'Luz',
    WATER: 'Água',
    GAS: 'Gás',
    INTERNET: 'Internet',
    PHONE: 'Telefone',
    OTHER: 'Outros',
  };
  return names[type] || type;
};

/**
 * Nomes de status em português
 */
export const getBillStatusName = (status: string): string => {
  const names: { [key: string]: string } = {
    PENDING: 'Pendente',
    PAID: 'Paga',
    OVERDUE: 'Vencida',
    CANCELLED: 'Cancelada',
  };
  return names[status] || status;
};

/**
 * Cores dos status
 */
export const getBillStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    PENDING: '#FFA500',
    PAID: '#4CAF50',
    OVERDUE: '#F44336',
    CANCELLED: '#9E9E9E',
  };
  return colors[status] || '#000000';
};

