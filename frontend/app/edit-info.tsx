import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { changePassword, changeUsername, changeEmail, getCurrentUser } from "./services/authService";
import { Ionicons } from '@expo/vector-icons';

export default function EditInfo() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [passwordForUsername, setPasswordForUsername] = useState("");
  const [passwordForEmail, setPasswordForEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordForUsername, setShowPasswordForUsername] = useState(false);
  const [showPasswordForEmail, setShowPasswordForEmail] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setNewUsername(currentUser.username || currentUser.displayName || "");
        setNewEmail(currentUser.email || "");
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const handleChangePassword = async () => {
    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Erro", "Preencha todos os campos de senha");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert("Erro", "A nova senha deve ser diferente da senha atual");
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(currentPassword, newPassword);

      if (result.success) {
        Alert.alert(
          "Sucesso!",
          result.message,
          [
            {
              text: "OK",
              onPress: () => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }
            }
          ]
        );
      } else {
        Alert.alert("Erro", result.message);
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert("Erro", "Erro inesperado ao alterar senha");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUsername = async () => {
    if (!newUsername || newUsername.trim().length === 0) {
      Alert.alert("Erro", "Nome de usuário não pode estar vazio");
      return;
    }

    if (!passwordForUsername) {
      Alert.alert("Erro", "Digite sua senha para confirmar a alteração");
      return;
    }

    if (newUsername === (user?.username || user?.displayName)) {
      Alert.alert("Aviso", "O nome é o mesmo que o atual");
      return;
    }

    setLoading(true);

    try {
      const result = await changeUsername(newUsername.trim(), passwordForUsername);

      if (result.success) {
        Alert.alert(
          "Sucesso!",
          result.message,
          [
            {
              text: "OK",
              onPress: async () => {
                await loadUserData();
                setPasswordForUsername("");
              }
            }
          ]
        );
      } else {
        Alert.alert("Erro", result.message);
      }
    } catch (error) {
      console.error('Erro ao alterar nome:', error);
      Alert.alert("Erro", "Erro inesperado ao alterar nome");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      Alert.alert("Erro", "Email inválido");
      return;
    }

    if (!passwordForEmail) {
      Alert.alert("Erro", "Digite sua senha para confirmar a alteração");
      return;
    }

    if (newEmail === user?.email) {
      Alert.alert("Aviso", "O email é o mesmo que o atual");
      return;
    }

    setLoading(true);

    try {
      const result = await changeEmail(newEmail.trim(), passwordForEmail);

      if (result.success) {
        Alert.alert(
          "Sucesso!",
          result.message,
          [
            {
              text: "OK",
              onPress: async () => {
                await loadUserData();
                setPasswordForEmail("");
              }
            }
          ]
        );
      } else {
        Alert.alert("Erro", result.message);
      }
    } catch (error) {
      console.error('Erro ao alterar email:', error);
      Alert.alert("Erro", "Erro inesperado ao alterar email");
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Alterar Informações</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        {/* Seção Alterar Nome */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Alterar Nome</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Altere seu nome de usuário
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome de Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu novo nome"
              value={newUsername}
              onChangeText={setNewUsername}
              editable={!loading}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha Atual (para confirmar)</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha atual"
                secureTextEntry={!showPasswordForUsername}
                value={passwordForUsername}
                onChangeText={setPasswordForUsername}
                editable={!loading}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPasswordForUsername(!showPasswordForUsername)}
              >
                <Ionicons 
                  name={showPasswordForUsername ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loading} />
          ) : (
            <TouchableOpacity 
              style={[styles.changeButton, styles.changeButtonSecondary]}
              onPress={handleChangeUsername}
            >
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={[styles.changeButtonText, styles.changeButtonTextSecondary]}>Salvar Nome</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seção Alterar Email */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Alterar Email</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Altere seu endereço de email
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Novo Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu novo email"
              value={newEmail}
              onChangeText={setNewEmail}
              editable={!loading}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha Atual (para confirmar)</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha atual"
                secureTextEntry={!showPasswordForEmail}
                value={passwordForEmail}
                onChangeText={setPasswordForEmail}
                editable={!loading}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPasswordForEmail(!showPasswordForEmail)}
              >
                <Ionicons 
                  name={showPasswordForEmail ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#007AFF" style={styles.loading} />
          ) : (
            <TouchableOpacity 
              style={[styles.changeButton, styles.changeButtonSecondary]}
              onPress={handleChangeEmail}
            >
              <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
              <Text style={[styles.changeButtonText, styles.changeButtonTextSecondary]}>Salvar Email</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Seção Alterar Senha */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={24} color="#007AFF" />
            <Text style={styles.sectionTitle}>Alterar Senha</Text>
          </View>
          
          <Text style={styles.sectionDescription}>
            Por segurança, você precisará confirmar sua senha atual para alterá-la
          </Text>

          {/* Senha Atual */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha Atual</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha atual"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                editable={!loading}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Nova Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nova Senha</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua nova senha (mín. 6 caracteres)"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Nova Senha */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Nova Senha</Text>
            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite a nova senha novamente"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={24} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Dicas de Segurança */}
          <View style={styles.tipsContainer}>
            <View style={styles.tipsHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
              <Text style={styles.tipsTitle}>Dicas de Segurança</Text>
            </View>
            <Text style={styles.tipText}>• Use pelo menos 6 caracteres</Text>
            <Text style={styles.tipText}>• Combine letras, números e símbolos</Text>
            <Text style={styles.tipText}>• Não use senhas óbvias</Text>
            <Text style={styles.tipText}>• Não compartilhe sua senha</Text>
          </View>

          {/* Botão de Alterar */}
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
          ) : (
            <TouchableOpacity 
              style={styles.changeButton}
              onPress={handleChangePassword}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.changeButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>
          )}
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
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  eyeButton: {
    padding: 12,
  },
  tipsContainer: {
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    lineHeight: 20,
  },
  changeButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  changeButtonSecondary: {
    backgroundColor: "#e3f2fd",
  },
  changeButtonTextSecondary: {
    color: "#007AFF",
  },
  loading: {
    marginVertical: 20,
  },
  comingSoon: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
});

