import { useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from "react-native";

export default function App() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [newUser, setNewUser] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [screen, setScreen] = useState<"login" | "forgot" | "register">("login");

  const handleLogin = () => {
    if (user === "teste" && password === "1234") {
      alert("Login bem-sucedido!"); // Aqui você pode navegar para outra tela
    } else {
      setError("Usuário ou senha inválidos!");
    }
  };

  const handleForgot = () => {
    alert(`E-mail enviado para ${email} (simulação)`);
    setEmail("");
    setScreen("login");
  };

  const handleRegister = () => {
    alert(`Usuário ${newUser} cadastrado (simulação)`);
    setNewUser("");
    setNewPassword("");
    setScreen("login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo!</Text>

      {screen === "login" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Usuário"
            value={user}
            onChangeText={setUser}
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Entrar" onPress={handleLogin} />

          <TouchableOpacity onPress={() => setScreen("forgot")}>
            <Text style={styles.link}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen("register")}>
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
          />

          <Button title="Enviar" onPress={handleForgot} />
          <Button title="Voltar" onPress={() => setScreen("login")} />
        </>
      )}

      {screen === "register" && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Novo usuário"
            value={newUser}
            onChangeText={setNewUser}
          />
          <TextInput
            style={styles.input}
            placeholder="Nova senha"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Button title="Cadastrar" onPress={handleRegister} />
          <Button title="Voltar" onPress={() => setScreen("login")} />
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
  input: { width: "100%", borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8 },
  error: { color: "red", marginBottom: 10 },
  link: { color: "blue", marginTop: 10 }
});
