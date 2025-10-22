import { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { registerUser, loginUser, resetPassword } from "../services/authService";

export default function App() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [screen, setScreen] = useState<"login" | "forgot" | "register">("login");

  const handleLogin = async () => {
    if (!user || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await loginUser(user, password);
      
      if (result.success) {
        Alert.alert("Sucesso!", result.message);
        setError("");
        // Aqui você pode navegar para outra tela
        // Por exemplo: router.push('/home')
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError("Erro inesperado ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      Alert.alert("Erro", "Digite seu email");
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email);
      Alert.alert(
        result.success ? "Sucesso!" : "Erro", 
        result.message
      );
      
      if (result.success) {
        setEmail("");
        setScreen("login");
      }
    } catch (error) {
      console.error('Erro na recuperação:', error);
      Alert.alert("Erro", "Erro ao enviar email de recuperação");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!newUser || !newEmail || !newPassword) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const result = await registerUser(newUser, newEmail, newPassword);
      
      if (result.success) {
        Alert.alert("Sucesso!", result.message + "\nFaça login com suas credenciais");
        setNewUser("");
        setNewEmail("");
        setNewPassword("");
        setScreen("login");
      } else {
        Alert.alert("Erro", result.message);
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      Alert.alert("Erro", "Erro ao cadastrar usuário");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>

      {screen === "login" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={user}
            onChangeText={setUser}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
          ) : (
            <Button title="Entrar" onPress={handleLogin} />
          )}

          <TouchableOpacity onPress={() => setScreen("forgot")} disabled={loading}>
            <Text style={styles.link}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen("register")} disabled={loading}>
            <Text style={styles.link}>Cadastrar</Text>
          </TouchableOpacity>
        </>
      )}

      {screen === "forgot" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
          ) : (
            <>
              <Button title="Enviar" onPress={handleForgot} />
              <Button title="Voltar" onPress={() => setScreen("login")} />
            </>
          )}
        </>
      )}

      {screen === "register" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Nome de usuário"
            value={newUser}
            onChangeText={setNewUser}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={newEmail}
            onChangeText={setNewEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha (mínimo 6 caracteres)"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            editable={!loading}
          />
          
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
          ) : (
            <>
              <Button title="Cadastrar" onPress={handleRegister} />
              <Button title="Voltar" onPress={() => setScreen("login")} />
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20, 
    backgroundColor: "#fff"
  },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  input: { 
    width: "100%", 
    borderWidth: 1, 
    padding: 10, 
    marginBottom: 10, 
    borderRadius: 8,
    borderColor: "#ccc"
  },
  error: { color: "red", marginBottom: 10 },
  link: { color: "blue", marginTop: 10 },
  loading: { marginVertical: 20 }
});