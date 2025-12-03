/**
 * Script de migração: Adiciona campo 'theme' aos documentos de usuários existentes
 * 
 * Uso:
 *   node scripts/add-theme-field.js
 * 
 * Este script:
 * - Adiciona o campo 'theme' (undefined) aos usuários que não possuem
 * - Não altera usuários que já possuem o campo definido
 * - Útil para migração de dados após adicionar o campo ao schema
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('[migration] ❌ Erro: MONGO_URI não encontrada nas variáveis de ambiente');
  console.error('[migration] Defina MONGO_URI ou MONGODB_URI antes de executar este script');
  process.exit(1);
}

// Schema simplificado (sem validações completas, apenas para migração)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: undefined,
  },
}, {
  timestamps: true,
  strict: false, // Permitir campos adicionais
});

const User = mongoose.model('User', userSchema, 'users');

async function addThemeField() {
  try {
    console.log('[migration] Conectando ao MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('[migration] ✅ Conectado ao MongoDB');

    // Buscar usuários sem campo theme definido (undefined ou null)
    const usersWithoutTheme = await User.find({
      $or: [
        { theme: { $exists: false } },
        { theme: null },
        { theme: undefined },
      ],
    });

    console.log(`[migration] Encontrados ${usersWithoutTheme.length} usuários sem campo 'theme' definido`);

    if (usersWithoutTheme.length === 0) {
      console.log('[migration] ✅ Nenhuma migração necessária. Todos os usuários já possuem o campo theme ou está definido.');
      await mongoose.disconnect();
      return;
    }

    // Atualizar cada usuário (definir theme como undefined explicitamente ou deixar vazio)
    // O campo já está no schema, então apenas garantir que documentos existentes têm a estrutura
    let updated = 0;
    for (const user of usersWithoutTheme) {
      // Não definir valor padrão - deixar undefined para que o sistema use preferência do usuário
      // ou detecte automaticamente via prefers-color-scheme
      await User.updateOne(
        { _id: user._id },
        { $set: { theme: undefined } }
      );
      updated++;
    }

    console.log(`[migration] ✅ Atualizados ${updated} usuários`);
    console.log('[migration] ℹ️  Campo "theme" definido como undefined (usuários podem definir preferência via UI)');

    await mongoose.disconnect();
    console.log('[migration] ✅ Desconectado do MongoDB');
    console.log('[migration] ✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('[migration] ❌ Erro durante a migração:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar migração
addThemeField();

