# Inicio Rapido - 2 Passos

## 1. Instalar e Iniciar

```bash
# Instalar dependencias (so primeira vez):
npm install

# Iniciar - MESMA REDE WiFi:
npx expo start

# OU Iniciar - QUALQUER REDE/4G:
npx expo start --tunnel
```

---

## 2. Abrir no Celular

1. Instale **Expo Go** no celular
2. Escaneie o QR Code
3. Pronto!

---

## Problemas?

### Porta ocupada:
```bash
npx expo start --tunnel --port 8082
```

### Cache:
```bash
npx expo start --tunnel --clear
```

### Mais ajuda:
Veja `documentacao/COMO_RODAR.md`

---

## 2 Modos:

| Modo | Comando | Quando usar |
|------|---------|-------------|
| **WiFi Local** | `npx expo start` | Mesma rede (rapido) |
| **Tunnel** | `npx expo start --tunnel` | Qualquer lugar (recomendado) |

---

**Bom desenvolvimento! 🚀**
