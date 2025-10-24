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
      },
      timeout: 30000, // 30 segundos
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
    const token = await getAuthToken();

    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }

    const response = await axios.get(`${API_URL}/bills/${userId}?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
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
    const token = await getAuthToken();

    const response = await axios.get(`${API_URL}/bills/detail/${billId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
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
    const token = await getAuthToken();

    const response = await axios.put(`${API_URL}/bills/${billId}`, data, {
      headers: { 'Authorization': `Bearer ${token}` },
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
    const token = await getAuthToken();

    const response = await axios.post(`${API_URL}/bills/${billId}/pay`, {}, {
      headers: { 'Authorization': `Bearer ${token}` },
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
    const token = await getAuthToken();

    const response = await axios.delete(`${API_URL}/bills/${billId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
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
    const token = await getAuthToken();

    const response = await axios.get(`${API_URL}/bills/${userId}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error.response?.data || error;
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

