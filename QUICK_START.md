# 🚀 Quick Start Guide

## Iniciando em 3 Passos

### Passo 1: Obter API Key da Groq (Grátis)

1. Acesse: https://console.groq.com/keys
2. Faça login ou crie uma conta
3. Clique em "Create API Key"
4. Copie a chave (começa com `gsk_`)

### Passo 2: Configurar o Projeto

#### 🪟 Windows

```powershell
# Clone o repositório
git clone https://github.com/CesarBraz7/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02
git checkout cesar-da-silva-braz

# Execute o setup automático
.\setup.bat
```

#### 🐧 Linux/Mac

```bash
# Clone o repositório
git clone https://github.com/CesarBraz7/desafio-gdash-2025-02.git
cd desafio-gdash-2025-02
git checkout cesar-da-silva-braz

# Execute o setup automático
chmod +x setup.sh
./setup.sh
```

O script irá pausar e pedir que você adicione sua API Key no arquivo `.env`:

```env
GROQ_API_KEY=gsk_sua_chave_aqui
```

### Passo 3: Acessar a Aplicação

Após o setup, acesse:

- **🌐 Frontend**: http://localhost:5173
- **🔐 Login**: admin@example.com / 123456

---

## 🎯 Próximos Passos

Após o sistema estar rodando:

1. ✅ Faça login com `admin@example.com` / `123456`
2. 📊 Explore o Dashboard com dados climáticos reais
3. 🤖 Teste a geração de insights com IA
4. 👥 Gerencie usuários na página Users
5. 📥 Exporte dados em CSV/XLSX

---

## 📞 Precisa de Ajuda?

- 📖 Leia o [README.md](./README.md) completo
