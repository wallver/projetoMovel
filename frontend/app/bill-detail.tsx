import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Clipboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as billService from './services/billService';

export default function BillDetailScreen() {
  const { billId } = useLocalSearchParams<{ billId: string }>();
  const [bill, setBill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    try {
      const response = await billService.getBill(billId);
      setBill(response.bill);
      setEditData({
        title: response.bill.title,
        value: String(response.bill.value),
        dueDate: response.bill.dueDate,
        notes: response.bill.notes || '',
      });
    } catch (error) {
      console.error('Erro ao carregar conta:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da conta');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await billService.updateBill(billId, {
        title: editData.title,
        value: parseFloat(editData.value),
        dueDate: editData.dueDate,
        notes: editData.notes,
      });

      Alert.alert('Sucesso', 'Conta atualizada com sucesso!');
      setEditMode(false);
      await loadBill(); // Recarregar dados atualizados
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a conta');
    }
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      'Confirmar Pagamento',
      'Marcar esta conta como paga?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await billService.markBillAsPaid(billId);
              Alert.alert('Sucesso', 'Conta marcada como paga! 🎉', [
                {
                  text: 'OK',
                  onPress: () => {
                    loadBill(); // Recarregar para mostrar novo status
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível marcar como paga');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await billService.deleteBill(billId);
              Alert.alert('Sucesso', 'Conta excluída com sucesso');
              router.back();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a conta');
            }
          },
        },
      ]
    );
  };

  const handleCopyBarcode = () => {
    if (bill?.barcode) {
      Clipboard.setString(bill.barcode);
      Alert.alert('✅ Copiado!', 'Código de barras copiado para a área de transferência');
    }
  };

  const handleCopyPix = () => {
    if (bill?.pixCode) {
      Clipboard.setString(bill.pixCode);
      Alert.alert('✅ Copiado!', 'Código Pix Copia e Cola copiado para a área de transferência');
    }
  };

  const formatBarcode = (barcode: string): string => {
    if (!barcode) return '';
    
    // Remover formatação existente
    const clean = barcode.replace(/[^\d]/g, '');
    
    // Formatar linha digitável (47-48 dígitos)
    if (clean.length === 47 || clean.length === 48) {
      // Formato: XXXXX.XXXXX XXXXX.XXXXXX XXXXX.XXXXXX X XXXXXXXXXXXXXXXX
      return clean.replace(
        /(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/,
        '$1.$2 $3.$4 $5.$6 $7 $8'
      );
    }
    
    // Se não conseguir formatar, retornar com espaços a cada 4 dígitos
    return clean.replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Data não disponível';
    
    const date = new Date(dateStr);
    
    // Verificar se a data é válida
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const getDaysUntilDue = (dueDate: string) => {
    if (!dueDate) return 0;
    
    const now = new Date();
    const due = new Date(dueDate);
    
    // Verificar se a data é válida
    if (isNaN(due.getTime())) {
      return 0;
    }
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Vencida há ${Math.abs(diffDays)} dias`;
    if (diffDays === 0) return 'Vence hoje!';
    if (diffDays === 1) return 'Vence amanhã';
    return `Vence em ${diffDays} dias`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!bill) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Conta não encontrada</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes da Conta</Text>
        <TouchableOpacity
          onPress={() => setEditMode(!editMode)}
          style={styles.headerButton}
        >
          <Ionicons name={editMode ? 'close' : 'pencil'} size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Imagem da conta */}
        <TouchableOpacity activeOpacity={0.9}>
          <Image source={{ uri: bill.imageUrl }} style={styles.billImage} />
        </TouchableOpacity>

        {/* Informações principais */}
        <View style={styles.infoCard}>
          {editMode ? (
            <>
              <Text style={styles.label}>Título</Text>
              <TextInput
                style={styles.input}
                value={editData.title}
                onChangeText={(text) => setEditData({ ...editData, title: text })}
              />

              <Text style={styles.label}>Valor</Text>
              <TextInput
                style={styles.input}
                value={editData.value}
                onChangeText={(text) => setEditData({ ...editData, value: text })}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Notas</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.notes}
                onChangeText={(text) => setEditData({ ...editData, notes: text })}
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.titleRow}>
                <Text style={styles.billTitle}>{bill.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: billService.getBillStatusColor(bill.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {billService.getBillStatusName(bill.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Valor:</Text>
                <Text style={styles.valueAmount}>{formatCurrency(bill.value)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Vencimento</Text>
                  <Text style={styles.infoValue}>{formatDate(bill.dueDate)}</Text>
                  <Text style={[
                    styles.daysUntil,
                    bill.status === 'OVERDUE' && styles.overdue
                  ]}>
                    {getDaysUntilDue(bill.dueDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="pricetag" size={20} color="#666" />
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Tipo</Text>
                  <Text style={styles.infoValue}>
                    {billService.getBillTypeName(bill.type)}
                  </Text>
                </View>
              </View>

              {bill.pixCode && (
                <View style={styles.pixContainer}>
                  <View style={styles.pixHeader}>
                    <Ionicons name="qr-code" size={24} color="#32BCAD" />
                    <Text style={styles.pixLabel}>Pix Copia e Cola</Text>
                    <View style={styles.pixBadge}>
                      <Text style={styles.pixBadgeText}>Recomendado</Text>
                    </View>
                  </View>
                  <View style={styles.pixContent}>
                    <Text style={styles.pixText} numberOfLines={2} selectable>
                      {bill.pixCode}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.copyButtonPix} 
                    onPress={handleCopyPix}
                  >
                    <Ionicons name="copy-outline" size={18} color="#FFF" />
                    <Text style={styles.copyButtonPixText}>Copiar Código Pix</Text>
                  </TouchableOpacity>
                  <Text style={styles.pixHint}>
                    💡 Copie e cole no app do seu banco para pagar instantaneamente
                  </Text>
                </View>
              )}

              {bill.barcode && (
                <View style={styles.barcodeContainer}>
                  <View style={styles.barcodeHeader}>
                    <Ionicons name="barcode" size={20} color="#666" />
                    <Text style={styles.barcodeLabel}>Código de Barras</Text>
                  </View>
                  <View style={styles.barcodeContent}>
                    <Text style={styles.barcodeText} selectable>
                      {formatBarcode(bill.barcode)}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.copyButton} 
                    onPress={handleCopyBarcode}
                  >
                    <Ionicons name="copy-outline" size={18} color="#007AFF" />
                    <Text style={styles.copyButtonText}>Copiar Código</Text>
                  </TouchableOpacity>
                </View>
              )}

              {bill.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notas:</Text>
                  <Text style={styles.notesText}>{bill.notes}</Text>
                </View>
              )}

              {bill.ocrConfidence && (
                <View style={styles.ocrInfo}>
                  <Text style={styles.ocrLabel}>
                    Confiança do OCR: {bill.ocrConfidence.toFixed(0)}%
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* Ações */}
        {!editMode && bill.status !== 'PAID' && (
          <TouchableOpacity style={styles.payButton} onPress={handleMarkAsPaid}>
            <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            <Text style={styles.payButtonText}>Marcar como Paga</Text>
          </TouchableOpacity>
        )}

        {!editMode && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash" size={24} color="#F44336" />
            <Text style={styles.deleteButtonText}>Excluir Conta</Text>
          </TouchableOpacity>
        )}

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  billImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  infoCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  billTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  valueLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  daysUntil: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  overdue: {
    color: '#F44336',
    fontWeight: '600',
  },
  pixContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5F4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#32BCAD',
  },
  pixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pixLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#32BCAD',
    marginLeft: 8,
    flex: 1,
  },
  pixBadge: {
    backgroundColor: '#32BCAD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pixBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFF',
  },
  pixContent: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#32BCAD',
    marginBottom: 12,
    maxHeight: 60,
  },
  pixText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 16,
  },
  copyButtonPix: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#32BCAD',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  copyButtonPixText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 6,
  },
  pixHint: {
    fontSize: 12,
    color: '#32BCAD',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  barcodeContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  barcodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barcodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  barcodeContent: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  barcodeText: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  notesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  ocrInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  ocrLabel: {
    fontSize: 12,
    color: '#1976D2',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    paddingVertical: 16,
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
  payButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F44336',
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 40,
  },
});

