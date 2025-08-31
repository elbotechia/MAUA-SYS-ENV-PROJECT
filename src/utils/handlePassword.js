import bcrypt from "bcryptjs";

// Objeto com métodos para manipular senhas
export const handlePassword = {
  // Função para gerar hash da senha (encrypt)
  encrypt: async (passwordPlainText) => {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(passwordPlainText, saltRounds);
    } catch (error) {
      console.error("Erro ao gerar hash da senha:", error);
      throw new Error("Erro ao processar senha");
    }
  },

  // Função para comparar senha com hash (compare)
  compare: async (passwordPlainText, passwordHash) => {
    try {
      return await bcrypt.compare(passwordPlainText, passwordHash);
    } catch (error) {
      console.error("Erro ao comparar senhas:", error);
      throw new Error("Erro ao validar senha");
    }
  },
};

// Manter compatibilidade com imports antigos
export const handlePasswordHash = handlePassword.encrypt;
export const handlePasswordCompare = handlePassword.compare;
