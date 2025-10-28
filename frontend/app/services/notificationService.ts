import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import axios from 'axios';
import { auth } from '../utils/firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Configurar notificações
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registrar para notificações push e obter token
 */
export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    if (!Device.isDevice) {
      Alert.alert('Aviso', 'Notificações push funcionam apenas em dispositivos físicos');
      return null;
    }

    // Verificar permissões existentes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Solicitar permissões se necessário
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Erro', 'Permissão para notificações foi negada');
      return null;
    }

    // Obter token do Expo
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    // Configurar canal de notificação para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Lembretes de Contas',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFA500',
      });
    }

    console.log('✅ Token de notificação obtido:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('Erro ao registrar notificações:', error);
    return null;
  }
};

/**
 * Agendar notificação local
 */
export const scheduleLocalNotification = async (
  title: string,
  body: string,
  trigger: Date | number,
  data?: any
) => {
  try {
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger:
        typeof trigger === 'number'
          ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: trigger }
          : {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: trigger,
              channelId: 'reminders',
            },
    });

    console.log('✅ Notificação agendada:', identifier);
    return identifier;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return null;
  }
};

/**
 * Cancelar notificação agendada
 */
export const cancelScheduledNotification = async (identifier: string) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('✅ Notificação cancelada:', identifier);
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
  }
};

/**
 * Cancelar todas as notificações agendadas
 */
export const cancelAllScheduledNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Todas as notificações canceladas');
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
};

/**
 * Buscar notificações do servidor
 */
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  return await user.getIdToken();
};

export const fetchNotifications = async (userId: string, limit: number = 50) => {
  try {
    const token = await getAuthToken();

    const response = await axios.get(`${API_URL}/notifications/${userId}?limit=${limit}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error);
    throw error.response?.data || error;
  }
};

/**
 * Marcar notificação como lida
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const token = await getAuthToken();

    const response = await axios.put(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        } 
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Erro ao marcar notificação:', error);
    throw error.response?.data || error;
  }
};

/**
 * Marcar todas como lidas
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const token = await getAuthToken();

    const response = await axios.put(
      `${API_URL}/notifications/${userId}/read-all`,
      {},
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        } 
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Erro ao marcar notificações:', error);
    throw error.response?.data || error;
  }
};

/**
 * Contar notificações não lidas
 */
export const countUnreadNotifications = async (userId: string) => {
  try {
    const token = await getAuthToken();

    const response = await axios.get(`${API_URL}/notifications/${userId}/unread-count`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao contar notificações:', error);
    throw error.response?.data || error;
  }
};

/**
 * Adicionar listener para notificações recebidas
 */
export const addNotificationReceivedListener = (
  handler: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(handler);
};

/**
 * Adicionar listener para quando usuário toca na notificação
 */
export const addNotificationResponseListener = (
  handler: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};

