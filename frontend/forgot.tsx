import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <TextInput style={styles.input} placeholder="Digite seu e-mail" value={email} onChangeText={setEmail}/>
      <Button title="Enviar" onPress={() => alert("E-mail enviado (simulação)")} />
      <Button title="Voltar" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:"center", alignItems:"center", padding:20 },
  title: { fontSize:24, fontWeight:"bold", marginBottom:20 },
  input: { width:"100%", borderWidth:1, padding:10, marginBottom:10, borderRadius:8 }
});
