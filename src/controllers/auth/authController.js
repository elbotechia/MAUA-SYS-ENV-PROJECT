import path from "path";
import dotenv from "dotenv";
import {db} from '../../../config/knex.js';
import { handlePassword } from "../../utils/handlePassword.js";
import { handleDateISONow } from "../../utils/handleDateISONow.js";
import { tokenSignIn } from "../../utils/handleJWT.js";
import { Pessoa } from "../../models/Pessoa.js";
import bcrypt from "bcryptjs";
dotenv.config();

const PATH_2_JSON = process.env.JSON_DIRECTORY || "DATA/JSON";

export class AuthController {
  async postSignUp(req, res) {
    try {
      // Verificar se há dados no body
      if (!req.body) {
        return res.status(400).json({
          success: false,
          message: "Dados não fornecidos",
        });
      }

      // Validar campos obrigatórios
      const { nomeReferencial, username, emailInstitucional, documentoOficial, role, tipo } = req.body;
      
      if (!nomeReferencial || !username || !emailInstitucional || !documentoOficial) {
        return res.status(400).json({
          success: false,
          error: "MISSING_REQUIRED_FIELDS"
        });
      }

      const pessoa = new Pessoa(
        nomeReferencial,
        username,
        emailInstitucional,
        await handlePassword.encrypt(documentoOficial),
        role || "user",
        tipo || "PF"
      );

      // Usar o novo método que cria pessoa no SQLite e profile/user no MongoDB
      const result = await pessoa.insertPessoaWithProfile();
      
      console.log("Pessoa e profile criados:", result);
      
      // Resposta com informações de ambos os bancos
      res.status(201).json({
        success: true,
        message: "Usuário e perfil criados com sucesso",
        data: {
          sqlite: {
            pessoa: result.sqlite.pessoa,
            account: result.sqlite.account
          },
          mongodb: {
            profile: {
              id: result.mongodb.profile._id,
              nomeReferencial: result.mongodb.profile.nomeReferencial,
              username: result.mongodb.profile.username,
              emailInstitucional: result.mongodb.profile.emailInstitucional
            },
            user: {
              id: result.mongodb.user._id,
              username: result.mongodb.user.username,
              role: result.mongodb.user.role,
              tipo: result.mongodb.user.tipo,
              isActive: result.mongodb.user.isActive
            }
          }
        }
      });
      
    } catch (error) {
      console.error("💥 Erro no postSignUp:", {
        message: error.message,
        code: error.code,
        errno: error.errno,
        stack: error.stack,
      });

      // Tratamento de erros específicos do MySQL
      if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("username")) {
          return res.status(409).json({
            success: false,
            message: "Username já está em uso",
            field: "username",
            error: "DUPLICATE_USERNAME",
          });
        } else if (errorMessage.includes("email")) {
          return res.status(409).json({
            success: false,
            message: "Email já está cadastrado",
            field: "email_institucional",
            error: "DUPLICATE_EMAIL",
          });
        }
      }

      // Erro genérico
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: error.message,
        details:
          process.env.NODE_ENV === "development"
            ? {
                code: error.code,
                errno: error.errno,
              }
            : undefined,
      });
    }
  }

  // Método para listar usuários (para teste)
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Buscar usuários com Knex
      const pessoas = await db("Pessoa")
        .select(
          "idPessoa",
          "nome_referencial",
          "username",
          "email_institucional",
          "role",
          "tipo",
          "location",
          "created_at"
        )
        .orderBy("created_at", "desc")
        .limit(limit)
        .offset(offset);

      // Contar total de registros
      const totalResult = await db("Pessoa")
        .count("idPessoa as total")
        .first();
      const total = totalResult.total;

      res.status(200).json({
        success: true,
        message: "Usuários listados com sucesso",
        data: pessoas,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao listar usuários",
        error: error.message,
      });
    }
  }

  // Método para buscar usuário por ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      const pessoa = await db("Pessoa")
        .select(
          "idPessoa",
          "nome_referencial",
          "username",
          "email_institucional",
          "role",
          "tipo",
          "location",
          "created_at",
          "updated_at"
        )
        .where("idPessoa", id)
        .first();

      if (!pessoa) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Usuário encontrado",
        data: pessoa,
      });
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao buscar usuário",
        error: error.message,
      });
    }
  }

  /**
   * Sincronizar usuário específico do SQLite para MongoDB
   * GET /auth/sync/:email
   */
  async syncUserToMongoDB(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email é obrigatório",
          error: "MISSING_EMAIL"
        });
      }

      const result = await Pessoa.syncSQLiteToMongoDB(email);

      res.status(200).json({
        success: true,
        message: "Usuário sincronizado com sucesso",
        data: result
      });

    } catch (error) {
      console.error("Erro na sincronização:", error);
      
      if (error.message.includes("não encontrada")) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado no MySQL",
          error: "USER_NOT_FOUND"
        });
      }

      res.status(500).json({
        success: false,
        message: "Erro na sincronização",
        error: error.message
      });
    }
  }

  /**
   * Migrar todos os usuários do SQLite para MongoDB
   * POST /auth/migrate-all
   */
  async migrateAllUsers(req, res) {
    try {
      console.log("🚀 Iniciando migração de todos os usuários...");
      
      const results = await Pessoa.migrateAllUsersToMongoDB();
      
      const summary = {
        total: results.length,
        successful: results.filter(r => r.status === "success").length,
        failed: results.filter(r => r.status === "error").length
      };

      console.log("📊 Resumo da migração:", summary);

      res.status(200).json({
        success: true,
        message: "Migração concluída",
        summary,
        details: results
      });

    } catch (error) {
      console.error("Erro na migração em lote:", error);
      res.status(500).json({
        success: false,
        message: "Erro na migração em lote",
        error: error.message
      });
    }
  }

  async postSignIn(req, res) {
    try {
      console.log('🔐 LOGIN REQUEST - Body:', JSON.stringify(req.body, null, 2));
      
      // Aceitar tanto 'identify' quanto 'identifier' para compatibilidade
      const { identify, identifier, password } = req.body;
      const userIdentifier = identify || identifier;

      console.log('🔍 Extracted values:', { identify, identifier, userIdentifier, password: password ? '***' : 'undefined' });

      // Verificar se os dados foram fornecidos
      if (!userIdentifier || !password) {
        console.log('❌ MISSING_REQUIRED_FIELDS - userIdentifier:', userIdentifier, 'password:', password ? '***' : 'undefined');
        return res.status(400).json({
          success: false,
          message: "Email/username e senha são obrigatórios",
          error: "MISSING_REQUIRED_FIELDS"
        });
      }

      // Buscar usuário no banco de dados
      const user = await db("Pessoa")
        .select("idPessoa", "nome_referencial", "username", "email_institucional", "password_hash", "role", "tipo")
        .where("email_institucional", userIdentifier)
        .orWhere("username", userIdentifier)
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
          error: "USER_NOT_FOUND"
        });
      }

      // Verificar senha usando o helper
      const isPasswordValid = await handlePassword.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Senha incorreta",
          error: "INVALID_PASSWORD"
        });
      }

      // Gerar token usando o helper
      const token = await tokenSignIn({
        userObj: {
          id: user.idPessoa,
          username: user.username,
          email: user.email_institucional,
          role: user.role,
          tipo: user.tipo
        }
      });

      res.status(200).json({
        success: true,
        message: "Login realizado com sucesso",
        data: {
          user: {
            id: user.idPessoa,
            nome: user.nome_referencial,
            username: user.username,
            email: user.email_institucional,
            role: user.role,
            tipo: user.tipo
          },
          token,
        },
      });
    } catch (error) {
      console.error("Erro ao realizar login:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao realizar login",
        error: error.message,
      });
    } 
  }

  async postRecoverPassword(req, res) {
    try {
      const {identify, documentoOficial, newPassword} = req.body;

      // Verificar se os dados foram fornecidos
      if (!identify || !documentoOficial || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email/username, documento oficial e nova senha são obrigatórios",
          error: "MISSING_FIELDS"
        });
      }

      // Buscar usuário no banco de dados
      const user = await db("Pessoa")
        .select("idPessoa", "nome_referencial", "username", "email_institucional", "location", "role", "tipo")
        .where("email_institucional", identify)
        .orWhere("username", identify)
        .first();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado",
          error: "USER_NOT_FOUND"
        });
      }

      // Verificar documento oficial (que foi usado como senha inicial)
      const isDocumentValid = await handlePassword.compare(documentoOficial, user.location);
      
      if (!isDocumentValid) {
        return res.status(401).json({
          success: false,
          message: "Documento oficial incorreto",
          error: "INVALID_DOCUMENT"
        });
      }

      // Atualizar a senha no banco de dados
      const newHashedPassword = await handlePassword.encrypt(newPassword);

      await db("Pessoa")
        .where("idPessoa", user.idPessoa)
        .update({
          password_hash: newHashedPassword,
          updated_at: handleDateISONow()
        });

      res.status(200).json({
        success: true,
        message: "Senha atualizada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao recuperar senha:", error);
      res.status(500).json({
        success: false,
        message: "Erro ao recuperar senha",
        error: error.message,
      });
    }
  }
}
