import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getCurrentUser, logoutUser } from "./services/authService";
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        router.replace('/');
        return;
      }

      setUser(currentUser);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      Alert.alert("Erro", "Erro ao carregar dados do usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await logoutUser();
              if (result.success) {
                router.replace('/');
              } else {
                Alert.alert("Erro", result.message);
              }
            } catch (error) {
              console.error('Erro no logout:', error);
              Alert.alert("Erro", "Erro ao fazer logout");
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header com avatar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Início</Text>
        
        <TouchableOpacity 
          style={styles.avatarButton}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Ionicons name="person-circle" size={40} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Dropdown do avatar */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <TouchableOpacity 
            style={styles.dropdownItem}
            onPress={() => {
              setShowDropdown(false);
              router.push('/profile');
            }}
          >
            <Ionicons name="person" size={20} color="#007AFF" />
            <Text style={styles.dropdownText}>Meu Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dropdownItem}
            onPress={() => {
              setShowDropdown(false);
              router.push('/settings');
            }}
          >
            <Ionicons name="settings" size={20} color="#007AFF" />
            <Text style={styles.dropdownText}>Configurações</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.dropdownItem}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#FF3B30" />
            <Text style={[styles.dropdownText, styles.logoutText]}>Sair</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Conteúdo principal */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Bem-vindo, {user?.username || user?.displayName}! 👋
        </Text>
        
        <Text style={styles.subtitle}>
          Este é seu painel principal
        </Text>

        {/* Cards de funcionalidades futuras */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity style={styles.card}>
            <Ionicons name="notifications" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>Lembretes</Text>
            <Text style={styles.cardDescription}>Em breve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="list" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>Tarefas</Text>
            <Text style={styles.cardDescription}>Em breve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="calendar" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>Agenda</Text>
            <Text style={styles.cardDescription}>Em breve</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <Ionicons name="stats-chart" size={32} color="#007AFF" />
            <Text style={styles.cardTitle}>Relatórios</Text>
            <Text style={styles.cardDescription}>Em breve</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  avatarButton: {
    padding: 4,
  },
  dropdown: {
    position: "absolute",
    top: 100,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutText: {
    color: "#FF3B30",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
});
