import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

/**
 * Service para captura e manipulação de imagens
 */

/**
 * Solicitar permissões de câmera
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Negada',
        'É necessário permitir acesso à câmera para escanear contas.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de câmera:', error);
    return false;
  }
};

/**
 * Solicitar permissões de galeria
 */
export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Negada',
        'É necessário permitir acesso à galeria para selecionar imagens.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de galeria:', error);
    return false;
  }
};

/**
 * Tirar foto com a câmera
 */
export const takePicture = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Erro ao tirar foto:', error);
    Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
    return null;
  }
};

/**
 * Selecionar imagem da galeria
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Erro ao selecionar imagem:', error);
    Alert.alert('Erro', 'Não foi possível selecionar a imagem. Tente novamente.');
    return null;
  }
};

/**
 * Mostrar opções de captura (câmera ou galeria)
 */
export const showImagePickerOptions = (): Promise<'camera' | 'gallery' | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Adicionar Conta',
      'Escolha uma opção:',
      [
        {
          text: '📷 Tirar Foto',
          onPress: () => resolve('camera'),
        },
        {
          text: '🖼️ Escolher da Galeria',
          onPress: () => resolve('gallery'),
        },
        {
          text: 'Cancelar',
          onPress: () => resolve(null),
          style: 'cancel',
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Obter informações do arquivo
 */
export const getFileInfo = async (uri: string) => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo;
  } catch (error) {
    console.error('Erro ao obter informações do arquivo:', error);
    return null;
  }
};

/**
 * Comprimir imagem (se necessário)
 */
export const compressImage = async (uri: string, quality: number = 0.7): Promise<string> => {
  try {
    const manipulatedImage = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality,
    });

    if (!manipulatedImage.canceled) {
      return manipulatedImage.assets[0].uri;
    }

    return uri;
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    return uri;
  }
};

