import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Configurações do banco de dados
const DB_PATH = process.env.DB_PATH || path.resolve('database', 'dbespacial.db');

// Classe para gerenciar conexões com SQLite
export class DatabaseManager {
    constructor() {
        this.db = null;
    }

    // Abrir conexão com o banco
    async connect() {
        try {
            this.db = await open({
                filename: DB_PATH,
                driver: sqlite3.Database
            });
            
            console.log('✅ Conectado ao banco SQLite:', DB_PATH);
            return this.db;
        } catch (error) {
            console.error('❌ Erro ao conectar com o banco:', error);
            throw error;
        }
    }

    // Fechar conexão
    async close() {
        if (this.db) {
            await this.db.close();
            console.log('🔐 Conexão com banco fechada');
        }
    }

    // Obter instância do banco
    async getDatabase() {
        if (!this.db) {
            await this.connect();
        }
        return this.db;
    }

    // Criar tabela de pessoas se não existir
    async createTables() {
        try {
            const db = await this.getDatabase();
            
            await db.exec(`
                CREATE TABLE IF NOT EXISTS pessoas (
                    idPessoa INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    nome_referencial TEXT NOT NULL,
                    tipo TEXT DEFAULT 'PF',
                    role TEXT DEFAULT 'USER',
                    username TEXT NOT NULL UNIQUE,
                    email_institucional TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    location TEXT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
            `);

            console.log('✅ Tabela "pessoas" criada/verificada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao criar tabelas:', error);
            throw error;
        }
    }
}

// Instância singleton do gerenciador
const dbManager = new DatabaseManager();

// Funções utilitárias para o banco
export const dbUtils = {
    // Inserir nova pessoa
    async insertPessoa(pessoaData) {
        try {
            const db = await dbManager.getDatabase();
            
            const result = await db.run(`
                INSERT INTO pessoas (
                    nome_referencial, tipo, role, username, 
                    email_institucional, password_hash, location, 
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                pessoaData.nome_referencial,
                pessoaData.tipo,
                pessoaData.role,
                pessoaData.username,
                pessoaData.email_institucional,
                pessoaData.password_hash,
                pessoaData.location,
                pessoaData.created_at,
                pessoaData.updated_at
            ]);

            return {
                id: result.lastID,
                ...pessoaData
            };
        } catch (error) {
            console.error('❌ Erro ao inserir pessoa:', error);
            throw error;
        }
    },

    // Buscar pessoa por username
    async findByUsername(username) {
        try {
            const db = await dbManager.getDatabase();
            return await db.get('SELECT * FROM pessoas WHERE username = ?', [username]);
        } catch (error) {
            console.error('❌ Erro ao buscar por username:', error);
            return null;
        }
    },

    // Buscar pessoa por email
    async findByEmail(email) {
        try {
            const db = await dbManager.getDatabase();
            return await db.get('SELECT * FROM pessoas WHERE email_institucional = ?', [email]);
        } catch (error) {
            console.error('❌ Erro ao buscar por email:', error);
            return null;
        }
    },

    // Buscar pessoa por ID
    async findById(id) {
        try {
            const db = await dbManager.getDatabase();
            return await db.get('SELECT * FROM pessoas WHERE idPessoa = ?', [id]);
        } catch (error) {
            console.error('❌ Erro ao buscar por ID:', error);
            return null;
        }
    },

    // Listar todas as pessoas com paginação
    async findAll(page = 1, limit = 10) {
        try {
            const db = await dbManager.getDatabase();
            const offset = (page - 1) * limit;
            
            const pessoas = await db.all(
                'SELECT * FROM pessoas ORDER BY created_at DESC LIMIT ? OFFSET ?',
                [limit, offset]
            );
            
            const total = await db.get('SELECT COUNT(*) as count FROM pessoas');
            
            return {
                pessoas,
                total: total.count,
                page,
                limit,
                totalPages: Math.ceil(total.count / limit)
            };
        } catch (error) {
            console.error('❌ Erro ao listar pessoas:', error);
            return { pessoas: [], total: 0, page, limit, totalPages: 0 };
        }
    }
};

// Inicializar banco ao importar
(async () => {
    try {
        await dbManager.connect();
        await dbManager.createTables();
    } catch (error) {
        console.error('❌ Erro na inicialização do banco:', error);
    }
})();

export default dbManager;
