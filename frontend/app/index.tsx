import { Redirect } from 'expo-router';

export default function Index() {
  // Redirecionar para a tela de login
  return <Redirect href="/(tabs)/index" />;
}

