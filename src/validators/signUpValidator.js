import { body, param, query } from 'express-validator';

// Regex patterns for document validation
const documentRegex = {
    // CPF: formato 000.000.000-00
    cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    
    // RG: formato 00.000.000-0 ou 0.000.000-0 (pode ter 8 ou 9 dígitos)
    rg: /^\d{1,2}\.\d{3}\.\d{3}-[\dX]$/,
    
    // CNPJ: formato 00.000.000/0000-00
    cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    
    // CNPJ Alfanumérico futuro: formato AA000000000000 (2 letras + 12 números)
    cnpjAlphanumeric: /^[A-Z]{2}\d{12}$/,
    
    // Documento genérico (aceita CPF, RG ou CNPJ)
    document: /^(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{1,2}\.\d{3}\.\d{3}-[\dX]|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|[A-Z]{2}\d{12})$/
};

// Função para validar CPF (algoritmo de verificação)
const validateCPF = (cpf) => {
    // Remove formatação
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cleanCPF[9]) !== digit1) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleanCPF[10]) === digit2;
};

// Função para validar CNPJ (algoritmo de verificação)
const validateCNPJ = (cnpj) => {
    // Remove formatação
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cleanCNPJ.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Validação dos dígitos verificadores
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseInt(cleanCNPJ[i]) * weights1[i];
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    
    if (parseInt(cleanCNPJ[12]) !== digit1) return false;
    
    sum = 0;
    for (let i = 0; i < 13; i++) {
        sum += parseInt(cleanCNPJ[i]) * weights2[i];
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    
    return parseInt(cleanCNPJ[13]) === digit2;
};

export const signUpValidator = {
    create: [
        // nome_referencial - obrigatório
        body('nome_referencial')
            .notEmpty()
            .withMessage('Nome referencial é obrigatório')
            .isString()
            .withMessage('Nome referencial deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome referencial deve ter entre 2 e 100 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
            .withMessage('Nome referencial pode conter apenas letras, espaços, hífens e apóstrofos'),

        // tipo - opcional, default 'PF'
        body('tipo')
            .optional()
            .isIn(['PF', 'PJ', 'CLT'])
            .withMessage('Tipo deve ser PF, PJ ou CLT'),

        // role - opcional, default 'USER'
        body('role')
            .optional()
            .isIn(['USER', 'ADMIN', 'PROFESSOR', 'MENTOR', 'ORIENTADOR', 'MONITOR', 'ALUNO', 'PESQUISADOR', 'EMPRESA', 'INSTITUIÇÃO'])
            .withMessage('Role inválida'),

        // username - obrigatório e único
        body('username')
            .notEmpty()
            .withMessage('Username é obrigatório')
            .isString()
            .withMessage('Username deve ser uma string')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username pode conter apenas letras, números, hífens e sublinhados'),

        // email_institucional - obrigatório e único
        body('email_institucional')
            .notEmpty()
            .withMessage('Email institucional é obrigatório')
            .isEmail()
            .withMessage('Formato de email inválido')
            .normalizeEmail()
            .isLength({ max: 200 })
            .withMessage('Email não pode exceder 200 caracteres'),

        // password - obrigatório (será hashado para password_hash)
        body('password')
            .notEmpty()
            .withMessage('Senha é obrigatória')
            .isLength({ min: 8, max: 128 })
            .withMessage('Senha deve ter entre 8 e 128 caracteres')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Senha deve conter pelo menos: uma letra minúscula, uma maiúscula, um número e um caractere especial'),

        // confirmPassword - confirmação da senha
        body('confirmPassword')
            .notEmpty()
            .withMessage('Confirmação de senha é obrigatória')
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Senhas não coincidem');
                }
                return true;
            }),

        // location - opcional
        body('location')
            .optional()
            .isString()
            .withMessage('Localização deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Localização não pode exceder 200 caracteres'),

        // Validações de documento baseadas no tipo
        body('cpf')
            .optional()
            .matches(documentRegex.cpf)
            .withMessage('CPF deve estar no formato 000.000.000-00')
            .custom((value, { req }) => {
                // CPF obrigatório para PF
                if (req.body.tipo === 'PF' && !value) {
                    throw new Error('CPF é obrigatório para pessoas físicas');
                }
                if (value && !validateCPF(value)) {
                    throw new Error('CPF inválido');
                }
                return true;
            }),

        body('cnpj')
            .optional()
            .custom((value, { req }) => {
                // CNPJ obrigatório para PJ
                if (req.body.tipo === 'PJ' && !value) {
                    throw new Error('CNPJ é obrigatório para pessoas jurídicas');
                }
                if (value) {
                    // Formato tradicional CNPJ
                    if (documentRegex.cnpj.test(value)) {
                        if (!validateCNPJ(value)) {
                            throw new Error('CNPJ inválido');
                        }
                    }
                    // Formato alfanumérico futuro
                    else if (documentRegex.cnpjAlphanumeric.test(value)) {
                        return true;
                    }
                    else {
                        throw new Error('CNPJ deve estar no formato 00.000.000/0000-00 ou AA000000000000');
                    }
                }
                return true;
            }),

        body('rg')
            .optional()
            .matches(documentRegex.rg)
            .withMessage('RG deve estar no formato 00.000.000-0')
    ],

    update: [
        param('idPessoa')
            .isInt({ min: 1 })
            .withMessage('ID da pessoa deve ser um número inteiro válido'),
        
        body('nome_referencial')
            .optional()
            .isString()
            .withMessage('Nome referencial deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome referencial deve ter entre 2 e 100 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
            .withMessage('Nome referencial pode conter apenas letras, espaços, hífens e apóstrofos'),
        
        body('tipo')
            .optional()
            .isIn(['PF', 'PJ', 'CLT'])
            .withMessage('Tipo deve ser PF, PJ ou CLT'),
        
        body('role')
            .optional()
            .isIn(['USER', 'ADMIN', 'PROFESSOR', 'MENTOR', 'ORIENTADOR', 'MONITOR', 'ALUNO', 'PESQUISADOR', 'EMPRESA', 'INSTITUIÇÃO'])
            .withMessage('Role inválida'),
        
        body('username')
            .optional()
            .isString()
            .withMessage('Username deve ser uma string')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username pode conter apenas letras, números, hífens e sublinhados'),
        
        body('email_institucional')
            .optional()
            .isEmail()
            .withMessage('Formato de email inválido')
            .normalizeEmail()
            .isLength({ max: 200 })
            .withMessage('Email não pode exceder 200 caracteres'),
        
        body('location')
            .optional()
            .isString()
            .withMessage('Localização deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Localização não pode exceder 200 caracteres')
    ],

    changePassword: [
        param('idPessoa')
            .isInt({ min: 1 })
            .withMessage('ID da pessoa deve ser um número inteiro válido'),

        body('currentPassword')
            .notEmpty()
            .withMessage('Senha atual é obrigatória'),

        body('newPassword')
            .isLength({ min: 8, max: 128 })
            .withMessage('Nova senha deve ter entre 8 e 128 caracteres')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Nova senha deve conter pelo menos: uma letra minúscula, uma maiúscula, um número e um caractere especial'),

        body('confirmPassword')
            .custom((value, { req }) => {
                if (value !== req.body.newPassword) {
                    throw new Error('Confirmação de senha não confere');
                }
                return true;
            })
    ],

    getByUsername: [
        param('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username pode conter apenas letras, números, hífens e sublinhados')
    ],

    getById: [
        param('idPessoa')
            .isInt({ min: 1 })
            .withMessage('ID da pessoa deve ser um número inteiro válido')
    ],

    delete: [
        param('idPessoa')
            .isInt({ min: 1 })
            .withMessage('ID da pessoa deve ser um número inteiro válido')
    ],

    getAll: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Página deve ser um número inteiro positivo'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limite deve estar entre 1 e 100'),
        
        query('role')
            .optional()
            .isIn(['USER', 'ADMIN', 'PROFESSOR', 'MENTOR', 'ORIENTADOR', 'MONITOR', 'ALUNO', 'PESQUISADOR', 'EMPRESA', 'INSTITUIÇÃO'])
            .withMessage('Role inválida para filtro'),
        
        query('tipo')
            .optional()
            .isIn(['PF', 'PJ', 'CLT'])
            .withMessage('Tipo inválido para filtro'),
        
        query('search')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

        query('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres'),

        query('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('Email deve ter formato válido'),

        query('location')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Localização deve ter entre 1 e 200 caracteres')
    ],

    signIn: [
        body('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username pode conter apenas letras, números, hífens e sublinhados'),

        body('password')
            .isLength({ min: 8, max: 128 })
            .withMessage('Senha deve ter entre 8 e 128 caracteres')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .withMessage('Senha deve conter pelo menos: uma letra minúscula, uma maiúscula, um número e um caractere especial')
    ]

};

// Export das funções de validação para uso em outros lugares se necessário
export { validateCPF, validateCNPJ, documentRegex };