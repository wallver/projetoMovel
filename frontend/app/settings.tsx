import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const router = useRouter();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir Conta",
      "Esta funcionalidade ainda não está disponível",
      [{ text: "OK" }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        {/* Seção Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/edit-info')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
                <Ionicons name="create" size={24} color="#007AFF" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Alterar Informações</Text>
                <Text style={styles.menuItemDescription}>Senha, email e outros dados</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleDeleteAccount}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#ffebee' }]}>
                <Ionicons name="trash" size={24} color="#FF3B30" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={[styles.menuItemTitle, { color: '#FF3B30' }]}>Excluir Conta</Text>
                <Text style={styles.menuItemDescription}>Remover permanentemente</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Seção Preferências */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="notifications" size={24} color="#9C27B0" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Notificações</Text>
                <Text style={styles.menuItemDescription}>Gerenciar alertas</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
                <Ionicons name="color-palette" size={24} color="#FF9500" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Aparência</Text>
                <Text style={styles.menuItemDescription}>Tema claro/escuro</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e8f5e9' }]}>
                <Ionicons name="language" size={24} color="#34C759" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Idioma</Text>
                <Text style={styles.menuItemDescription}>Português (Brasil)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Seção Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert("Versão", "1.0.0")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#e0f2f1' }]}>
                <Ionicons name="information-circle" size={24} color="#00ACC1" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Versão do App</Text>
                <Text style={styles.menuItemDescription}>1.0.0</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fce4ec' }]}>
                <Ionicons name="document-text" size={24} color="#E91E63" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Termos de Uso</Text>
                <Text style={styles.menuItemDescription}>Políticas e privacidade</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert("Em breve", "Funcionalidade em desenvolvimento")}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#fff8e1' }]}>
                <Ionicons name="help-circle" size={24} color="#FFC107" />
              </View>
              <View style={styles.menuItemText}>
                <Text style={styles.menuItemTitle}>Ajuda e Suporte</Text>
                <Text style={styles.menuItemDescription}>FAQ e contato</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#999",
  },
});