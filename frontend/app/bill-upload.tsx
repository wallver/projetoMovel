import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './utils/firebase';
import * as billService from './services/billService';

export default function BillUploadScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');

  const handleUpload = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        return;
      }

      setUploading(true);
      setProgress('Enviando imagem...');

      const response = await billService.uploadBill(imageUri, user.uid);

      setProgress('Processando com OCR...');
      
      // Aguardar um pouco para mostrar o progresso
      await new Promise(resolve => setTimeout(resolve, 1000));

      setProgress('Conta processada!');

      if (response.success) {
        Alert.alert(
          'Sucesso! 🎉',
          response.bill.needsReview
            ? 'Conta adicionada! Alguns dados podem precisar de revisão.'
            : 'Conta adicionada com sucesso!',
          [
            {
              text: 'Ver Detalhes',
              onPress: () => {
                router.replace({
                  pathname: '/bill-detail',
                  params: { billId: response.bill.id },
                });
              },
            },
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      Alert.alert(
        'Erro',
        error.message || 'Não foi possível processar a conta. Tente novamente.'
      );
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Conta</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </View>

      {uploading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.progressText}>{progress}</Text>
        </View>
      )}

      {!uploading && (
        <View style={styles.actionsContainer}>
          <Text style={styles.infoText}>
            📸 Revise a imagem antes de continuar
          </Text>
          <Text style={styles.subInfoText}>
            O sistema irá extrair automaticamente o valor e a data de vencimento da conta
          </Text>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Ionicons name="cloud-upload" size={24} color="#FFF" />
            <Text style={styles.uploadButtonText}>Processar Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetake}
            disabled={uploading}
          >
            <Ionicons name="camera" size={24} color="#007AFF" />
            <Text style={styles.retakeButtonText}>Tirar Outra Foto</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Dicas para melhor reconhecimento:</Text>
        <Text style={styles.tipText}>• Foto nítida e bem iluminada</Text>
        <Text style={styles.tipText}>• Enquadre toda a conta na foto</Text>
        <Text style={styles.tipText}>• Evite sombras e reflexos</Text>
        <Text style={styles.tipText}>• Você poderá editar os dados depois</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  imageContainer: {
    backgroundColor: '#000',
    aspectRatio: 3 / 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    padding: 32,
    alignItems: 'center',
  },
  progressText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  retakeButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  retakeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

