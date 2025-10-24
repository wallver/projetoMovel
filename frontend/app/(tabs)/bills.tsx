import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../utils/firebase';
import * as billService from '../services/billService';
import * as cameraService from '../services/cameraService';

export default function BillsScreen() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'OVERDUE'>('ALL');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadBills();
    loadStats();
  }, [filter]);

  const loadBills = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('Usuário não autenticado');
        setBills([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const filters: any = { limit: 50 };
      if (filter !== 'ALL') {
        filters.status = filter;
      }

      const response = await billService.listBills(user.uid, filters);
      setBills(response.bills || []);
    } catch (error: any) {
      console.error('Erro ao carregar contas:', error);
      // Não mostrar alerta de erro, apenas log no console
      // Por enquanto, deixar a lista vazia
      setBills([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setStats({ pending: 0, paid: 0, overdue: 0, total: 0 });
        return;
      }

      const response = await billService.getUserStats(user.uid);
      setStats(response.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Definir stats padrão em caso de erro
      setStats({ pending: 0, paid: 0, overdue: 0, total: 0 });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBills();
    loadStats();
  }, [filter]);

  const handleAddBill = async () => {
    const option = await cameraService.showImagePickerOptions();
    if (!option) return;

    let imageUri: string | null = null;

    if (option === 'camera') {
      imageUri = await cameraService.takePicture();
    } else {
      imageUri = await cameraService.pickImageFromGallery();
    }

    if (imageUri) {
      router.push({
        pathname: '/bill-upload' as any,
        params: { imageUri },
      });
    }
  };

  const handleBillPress = (bill: any) => {
    router.push({
      pathname: '/bill-detail' as any,
      params: { billId: bill.id },
    });
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
    
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return '✅';
      case 'PENDING':
        return '⏰';
      case 'OVERDUE':
        return '🚨';
      default:
        return '📄';
    }
  };

  const renderBillItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.billCard,
        item.status === 'OVERDUE' && styles.overdueBill,
      ]}
      onPress={() => handleBillPress(item)}
    >
      <View style={styles.billHeader}>
        <Text style={styles.billIcon}>{getStatusIcon(item.status)}</Text>
        <View style={styles.billInfo}>
          <Text style={styles.billTitle}>{item.title}</Text>
          <Text style={styles.billType}>
            {billService.getBillTypeName(item.type)}
          </Text>
        </View>
        <View style={styles.billValueContainer}>
          <Text style={styles.billValue}>{formatCurrency(item.value)}</Text>
          <Text style={styles.billDueDate}>
            {formatDate(item.dueDate)}
          </Text>
        </View>
      </View>
      
      <View style={styles.billFooter}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: billService.getBillStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {billService.getBillStatusName(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Contas</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <Ionicons name="person-circle" size={36} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pendentes</Text>
            <Text style={styles.statValue}>{stats.pending}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total a Pagar</Text>
            <Text style={styles.statValue}>
              {formatCurrency(stats.totalPendingValue)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Vencidas</Text>
            <Text style={[styles.statValue, styles.overdueText]}>
              {stats.overdue}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'PENDING' && styles.filterBtnActive]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>
            Pendentes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'PAID' && styles.filterBtnActive]}
          onPress={() => setFilter('PAID')}
        >
          <Text style={[styles.filterText, filter === 'PAID' && styles.filterTextActive]}>
            Pagas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'OVERDUE' && styles.filterBtnActive]}
          onPress={() => setFilter('OVERDUE')}
        >
          <Text style={[styles.filterText, filter === 'OVERDUE' && styles.filterTextActive]}>
            Vencidas
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>Nenhuma conta encontrada</Text>
      <Text style={styles.emptySubtext}>
        Toque no botão + para adicionar sua primeira conta
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando contas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bills}
        renderItem={renderBillItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddBill}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
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
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  profileButton: {
    padding: 8,
    marginTop: -8,
  },
  statsContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overdueText: {
    color: '#F44336',
  },
  filterContainer: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFF',
  },
  billCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueBill: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  billHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  billIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  billType: {
    fontSize: 14,
    color: '#666',
  },
  billValueContainer: {
    alignItems: 'flex-end',
  },
  billValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  billDueDate: {
    fontSize: 12,
    color: '#666',
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

