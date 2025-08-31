import { v4 as uuidv4 } from "uuid";
import { handlePassword } from "../utils/handlePassword.js";
import { db } from "../../config/knex.js";
import { User } from "./schemas/user.js";
import { Profile } from "./schemas/profile.js";
export class Pessoa {
  constructor(
    nomeReferencial,
    username,
    emailInstitucional,
    documentoOficial,
    role = "user",
    tipo = "PF"
  ) {
    this.managerKey = this.generateKeyManager();
    this.nomeReferencial = nomeReferencial;
    this.username = username;
    this.emailInstitucional = emailInstitucional;
    this.location = documentoOficial;
    this.password = documentoOficial;
    this.role = role;
    this.tipo = tipo;
    this.createdAt = this.generateDateIso();
    this.updatedAt = this.generateDateIso();
  }

  generateKeyManager() {
    return uuidv4();
  }

  generateHashKey(key) {
    return handlePassword.encrypt(key);
  }

  generateDateIso() {
    const date = new Date();
    return date.toISOString();
  }

  toDBModel() {
    return {
      nome_referencial: this.nomeReferencial,
      tipo: this.tipo,
      role: this.role,
      username: this.username,
      email_institucional: this.emailInstitucional,
      password_hash: this.password,
      location: this.location,
      created_at: this.createdAt,
      updated_at: this.generateDateIso(),
    };
  }

  /**
   * Gera um profile no MongoDB a partir dos dados da pessoa
   * @returns {Promise<Object>} Profile criado no MongoDB
   */
  async generateProfile() {
    try {
      const profileData = {
        nomeReferencial: this.nomeReferencial,
        username: this.username,
        emailInstitucional: this.emailInstitucional,
        bio: null,
        email: null,
        telefone: null,
        estado: null,
        pais: "Brasil",
        dataNascimento: null,
        nacionalidade: "Brasileira",
        educacao: [],
        projetos: [],
        profissionais: [],
        pesquisa: [],
        habilidades: [],
        certificacoes: [],
        idiomas: [],
        interessesProfissionais: [],
        redesSociais: [
          { linkedin: null },
          { github: null },
          { twitter: null },
          { facebook: null },
          { instagram: null },
          { youtube: null }
        ],
        fotoPerfil: null,
        fotoCapa: null
      };

      const newProfile = await Profile.create(profileData);
      return newProfile;
    } catch (error) {
      console.error("Erro ao criar profile:", error);
      throw new Error(`Erro ao gerar profile: ${error.message}`);
    }
  }

  /**
   * Gera um usuário no MongoDB para autenticação
   * @param {String} profileId - ID do profile criado
   * @returns {Promise<Object>} User criado no MongoDB
   */
  async generateUser(profileId) {
    try {
      const userData = {
        username: this.username,
        emailInstitucional: this.emailInstitucional,
        passwordHash: this.password,
        role: this.role,
        tipo: this.tipo,
        isActive: true,
        profileId: profileId
      };

      const newUser = await User.create(userData);
      return newUser;
    } catch (error) {
      console.error("Erro ao criar usuário MongoDB:", error);
      throw new Error(`Erro ao gerar usuário: ${error.message}`);
    }
  }

  /**
   * Inserir pessoa no MySQL e criar profile/user no MongoDB
   * @returns {Promise<Object>} Resultado completo da operação
   */
  async insertPessoaWithProfile() {
    let insertedPessoaId = null;
    let insertedAccountId = null;
    
    try {
      console.log('🚀 Iniciando inserção de pessoa com profile...');
      console.log('📝 Dados da pessoa:', {
        nomeReferencial: this.nomeReferencial,
        tipo: this.tipo,
        role: this.role,
        username: this.username,
        emailInstitucional: this.emailInstitucional,
        location: this.location
      });

      // 1. Inserir pessoa no MySQL usando Knex (prepared statement) - TABELA PESSOA
      const pessoaData = {
        nome_referencial: this.nomeReferencial,
        tipo: this.tipo,
        role: this.role,
        username: this.username,
        email_institucional: this.emailInstitucional,
        password_hash: this.password,
        location: this.location,
        created_at: this.createdAt,
        updated_at: this.generateDateIso()
      };

      console.log('💾 Inserindo pessoa na tabela Pessoa...');
      const [pessoaId] = await db('Pessoa').insert(pessoaData);
      insertedPessoaId = pessoaId;
      console.log('✅ Pessoa inserida com ID:', pessoaId);

      // 2. Buscar pessoa inserida
      const pessoaInserida = await db('Pessoa')
        .select('*')
        .where('idPessoa', pessoaId)
        .first();

      if (!pessoaInserida) {
        throw new Error('Pessoa não foi encontrada após inserção');
      }

      // 3. Criar Account no MySQL
      let accountInserida = null;
      try {
        console.log('💾 Inserindo account...');
        const accountData = {
          idPessoa_Pessoa: pessoaId,
          username: this.username,
          location: this.location
        };
        
        const [accountId] = await db('Account').insert(accountData);
        insertedAccountId = accountId;
        
        accountInserida = await db('Account')
          .select('*')
          .where('idAccount', accountId)
          .first();
        
        console.log('✅ Account criada com ID:', accountId);
      } catch (accountError) {
        console.log('⚠️ Erro ao criar account:', accountError.message);
        // Continuar sem account se houver erro
      }

      // 4. Criar Profile no MongoDB
      console.log('📄 Criando profile no MongoDB...');
      const mongoProfile = await this.generateProfile();
      console.log('✅ Profile MongoDB criado:', mongoProfile._id);

      // 5. Criar User no MongoDB
      console.log('👤 Criando user no MongoDB...');
      const mongoUser = await this.generateUser(mongoProfile._id);
      console.log('✅ User MongoDB criado:', mongoUser._id);

      const result = {
        sqlite: {
          pessoa: pessoaInserida,
          account: accountInserida
        },
        mongodb: {
          profile: mongoProfile,
          user: mongoUser
        }
      };

      console.log('🎉 Inserção completa realizada com sucesso!');
      return result;

    } catch (error) {
      console.error('💥 Erro na operação completa de inserção:', {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        sql: error.sql
      });

      // Rollback: tentar remover registros criados em caso de erro
      try {
        if (insertedAccountId) {
          await db('Account').where('idAccount', insertedAccountId).del();
          console.log('🔄 Account removida no rollback');
        }
        if (insertedPessoaId) {
          await db('Pessoa').where('idPessoa', insertedPessoaId).del();
          console.log('🔄 Pessoa removida no rollback');
        }
      } catch (rollbackError) {
        console.error('❌ Erro no rollback:', rollbackError.message);
      }

      throw new Error(`Erro ao inserir pessoa com profile: ${error.sql || 'N/A'}; - ${error.sqlMessage || error.message}`);
    }
  }

  async insertPessoa2DB() {
    try {
      console.log('📝 Inserindo pessoa no banco MySQL...');
      
      // 1. Inserir pessoa usando Knex (prepared statement)
      const pessoaData = {
        nome_referencial: this.nomeReferencial,
        tipo: this.tipo,
        role: this.role,
        username: this.username,
        email_institucional: this.emailInstitucional,
        password_hash: this.password,
        location: this.location,
        created_at: this.createdAt,
        updated_at: this.generateDateIso()
      };

      const [pessoaId] = await db('Pessoa').insert(pessoaData);
      console.log('✅ Pessoa inserida com ID:', pessoaId);

      // 2. Buscar pessoa inserida
      const pessoaInserida = await db('Pessoa')
        .select('*')
        .where('idPessoa', pessoaId)
        .first();

      // 3. Tentar criar Account (se a tabela existir)
      let accountResult = null;
      try {
        const accountData = {
          idPessoa_Pessoa: pessoaId,
          username: this.username,
          location: this.location
        };
        
        const [accountId] = await db('Account').insert(accountData);
        
        accountResult = await db('Account')
          .select('*')
          .where('idAccount', accountId)
          .first();
          
        console.log('✅ Account criada:', accountId);
      } catch (accountError) {
        console.log('⚠️ Não foi possível criar Account:', accountError.message);
        // Retornar apenas os dados da pessoa se Account falhar
        return [pessoaInserida];
      }

      return accountResult ? [accountResult] : [pessoaInserida];
      
    } catch (error) {
      console.error('💥 Erro ao inserir pessoa:', {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      });
      throw error;
    }
  }

  /**
   * Sincronizar dados entre MySQL e MongoDB
   * Busca pessoa no MySQL e atualiza/cria profile no MongoDB
   * @param {String} emailInstitucional - Email para buscar a pessoa
   * @returns {Promise<Object>} Resultado da sincronização
   */
  static async syncSQLiteToMongoDB(emailInstitucional) {
    try {
      // 1. Buscar pessoa no MySQL
      const sqlitePessoa = await db("Pessoa")
        .select("*")
        .where("email_institucional", emailInstitucional)
        .first();

      if (!sqlitePessoa) {
                throw new Error("Pessoa não encontrada no MySQL");
      }

      // 2. Buscar account no MySQL (se existir)
      let sqliteAccount = null;
      try {
        sqliteAccount = await db("Account")
          .select("*")
          .where("idPessoa_Pessoa", sqlitePessoa.idPessoa)
          .first();
      } catch (error) {
        console.log('⚠️ Tabela Account não encontrada:', error.message);
      }

      // 3. Verificar se já existe profile no MongoDB
      let mongoProfile = await Profile.findOne({ 
        emailInstitucional: sqlitePessoa.email_institucional 
      });

      // 4. Criar ou atualizar profile no MongoDB
      if (!mongoProfile) {
        const profileData = {
          nomeReferencial: sqlitePessoa.nome_referencial,
          username: sqlitePessoa.username,
          emailInstitucional: sqlitePessoa.email_institucional,
          bio: null,
          email: null,
          telefone: null,
          estado: null,
          pais: "Brasil",
          dataNascimento: null,
          nacionalidade: "Brasileira",
          educacao: [],
          projetos: [],
          profissionais: [],
          pesquisa: [],
          habilidades: [],
          certificacoes: [],
          idiomas: [],
          interessesProfissionais: [],
          redesSociais: [
            { linkedin: null },
            { github: null },
            { twitter: null },
            { facebook: null },
            { instagram: null },
            { youtube: null }
          ],
          fotoPerfil: null,
          fotoCapa: null
        };

        mongoProfile = await Profile.create(profileData);
        console.log("✅ Profile criado no MongoDB");
      } else {
        console.log("ℹ️ Profile já existe no MongoDB");
      }

      // 5. Verificar se já existe user no MongoDB
      let mongoUser = await User.findOne({ 
        emailInstitucional: sqlitePessoa.email_institucional 
      });

      // 6. Criar ou atualizar user no MongoDB
      if (!mongoUser) {
        const userData = {
          username: sqlitePessoa.username,
          emailInstitucional: sqlitePessoa.email_institucional,
          passwordHash: sqlitePessoa.password_hash,
          role: sqlitePessoa.role,
          tipo: sqlitePessoa.tipo,
          isActive: true,
          profileId: mongoProfile._id
        };

        mongoUser = await User.create(userData);
        console.log("✅ User criado no MongoDB");
      } else {
        // Atualizar referência do profile se necessário
        if (!mongoUser.profileId) {
          mongoUser.profileId = mongoProfile._id;
          await mongoUser.save();
          console.log("✅ Profile ID atualizado no User MongoDB");
        }
        console.log("ℹ️ User já existe no MongoDB");
      }

      return {
        sqlite: {
          pessoa: sqlitePessoa,
          account: sqliteAccount
        },
        mongodb: {
          profile: mongoProfile,
          user: mongoUser
        },
        status: "synchronized"
      };

    } catch (error) {
      console.error("Erro na sincronização MySQL → MongoDB:", error);
      throw new Error(`Erro na sincronização: ${error.message}`);
    }
  }

  /**
   * Migrar todos os usuários do MySQL para MongoDB
   * @returns {Promise<Array>} Lista de usuários migrados
   */
  static async migrateAllUsersToMongoDB() {
    try {
      // Buscar todas as pessoas no MySQL
      const sqlitePessoas = await db("Pessoa").select("*");
      
      const migrationResults = [];

      for (const pessoa of sqlitePessoas) {
        try {
          const result = await Pessoa.syncSQLiteToMongoDB(pessoa.email_institucional);
          migrationResults.push({
            email: pessoa.email_institucional,
            status: "success",
            data: result
          });
          console.log(`✅ Migrado: ${pessoa.email_institucional}`);
        } catch (error) {
          migrationResults.push({
            email: pessoa.email_institucional,
            status: "error",
            error: error.message
          });
          console.error(`❌ Erro ao migrar ${pessoa.email_institucional}:`, error.message);
        }
      }

      return migrationResults;

    } catch (error) {
      console.error("Erro na migração em lote:", error);
      throw new Error(`Erro na migração: ${error.message}`);
    }
  }
}
