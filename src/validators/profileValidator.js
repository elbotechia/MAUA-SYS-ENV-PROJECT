import { body, param, query } from 'express-validator';

export const profileValidator = {
    // Validador para criar um novo perfil
    create: [
        // nomeReferencial - obrigatório
        body('nomeReferencial')
            .notEmpty()
            .withMessage('Nome referencial é obrigatório')
            .isString()
            .withMessage('Nome referencial deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome referencial deve ter entre 2 e 100 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
            .withMessage('Nome referencial pode conter apenas letras, espaços, hífens e apóstrofos'),

        // username - obrigatório
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

        // emailInstitucional - obrigatório
        body('emailInstitucional')
            .notEmpty()
            .withMessage('Email institucional é obrigatório')
            .isEmail()
            .withMessage('Formato de email inválido')
            .normalizeEmail()
            .isLength({ max: 200 })
            .withMessage('Email não pode exceder 200 caracteres'),

        // redesSociais - opcional
        body('redesSociais')
            .optional()
            .isArray()
            .withMessage('Redes sociais deve ser um array'),
        
        body('redesSociais.*.linkedin')
            .optional()
            .isURL()
            .withMessage('LinkedIn deve ser uma URL válida'),
        
        body('redesSociais.*.github')
            .optional()
            .isURL()
            .withMessage('GitHub deve ser uma URL válida'),
        
        body('redesSociais.*.twitter')
            .optional()
            .isURL()
            .withMessage('Twitter deve ser uma URL válida'),
        
        body('redesSociais.*.facebook')
            .optional()
            .isURL()
            .withMessage('Facebook deve ser uma URL válida'),
        
        body('redesSociais.*.instagram')
            .optional()
            .isURL()
            .withMessage('Instagram deve ser uma URL válida'),
        
        body('redesSociais.*.youtube')
            .optional()
            .isURL()
            .withMessage('YouTube deve ser uma URL válida'),

        // bio - opcional
        body('bio')
            .optional()
            .isString()
            .withMessage('Bio deve ser uma string')
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Bio não pode exceder 1000 caracteres'),

        // email - opcional
        body('email')
            .optional()
            .isEmail()
            .withMessage('Formato de email inválido')
            .normalizeEmail()
            .isLength({ max: 200 })
            .withMessage('Email não pode exceder 200 caracteres'),

        // telefone - opcional
        body('telefone')
            .optional()
            .matches(/^[\+]?[1-9][\d]{0,15}$/)
            .withMessage('Telefone deve ter formato válido'),

        // estado - opcional
        body('estado')
            .optional()
            .isString()
            .withMessage('Estado deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Estado deve ter entre 2 e 50 caracteres'),

        // pais - opcional
        body('pais')
            .optional()
            .isString()
            .withMessage('País deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('País deve ter entre 2 e 50 caracteres'),

        // dataNascimento - opcional
        body('dataNascimento')
            .optional()
            .isISO8601()
            .withMessage('Data de nascimento deve estar no formato ISO 8601'),

        // nacionalidade - opcional
        body('nacionalidade')
            .optional()
            .isString()
            .withMessage('Nacionalidade deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Nacionalidade deve ter entre 2 e 50 caracteres'),

        // educacao - opcional
        body('educacao')
            .optional()
            .isArray()
            .withMessage('Educação deve ser um array'),
        
        body('educacao.*.tagEducacao')
            .optional()
            .isString()
            .withMessage('Tag de educação deve ser uma string'),
        
        body('educacao.*.instituicao')
            .optional()
            .isString()
            .withMessage('Instituição deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Instituição não pode exceder 200 caracteres'),
        
        body('educacao.*.curso')
            .optional()
            .isString()
            .withMessage('Curso deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Curso não pode exceder 200 caracteres'),
        
        body('educacao.*.descricao')
            .optional()
            .isString()
            .withMessage('Descrição deve ser uma string')
            .trim()
            .isLength({ max: 500 })
            .withMessage('Descrição não pode exceder 500 caracteres'),
        
        body('educacao.*.anoInicio')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage('Ano de início deve ser um ano válido'),
        
        body('educacao.*.anoFim')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
            .withMessage('Ano de fim deve ser um ano válido'),
        
        body('educacao.*.logoInstituicao')
            .optional()
            .isMongoId()
            .withMessage('Logo da instituição deve ser um ID MongoDB válido'),

        // projetos - opcional
        body('projetos')
            .optional()
            .isArray()
            .withMessage('Projetos deve ser um array'),
        
        body('projetos.*.nome')
            .optional()
            .isString()
            .withMessage('Nome do projeto deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Nome do projeto não pode exceder 200 caracteres'),
        
        body('projetos.*.descricao')
            .optional()
            .isString()
            .withMessage('Descrição do projeto deve ser uma string')
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Descrição do projeto não pode exceder 1000 caracteres'),
        
        body('projetos.*.ano')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
            .withMessage('Ano do projeto deve ser um ano válido'),
        
        body('projetos.*.repositorio')
            .optional()
            .isURL()
            .withMessage('Repositório deve ser uma URL válida'),
        
        body('projetos.*.link')
            .optional()
            .isURL()
            .withMessage('Link do projeto deve ser uma URL válida'),
        
        body('projetos.*.documentacoes')
            .optional()
            .isArray()
            .withMessage('Documentações deve ser um array'),
        
        body('projetos.*.documentacoes.*')
            .optional()
            .isString()
            .withMessage('Documentação deve ser uma string'),
        
        body('projetos.*.cover')
            .optional()
            .isMongoId()
            .withMessage('Cover do projeto deve ser um ID MongoDB válido'),
        
        body('projetos.*.icon')
            .optional()
            .isMongoId()
            .withMessage('Ícone do projeto deve ser um ID MongoDB válido'),

        // profissionais - opcional
        body('profissionais')
            .optional()
            .isArray()
            .withMessage('Experiências profissionais deve ser um array'),
        
        body('profissionais.*.nome')
            .optional()
            .isString()
            .withMessage('Nome da experiência deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Nome da experiência não pode exceder 200 caracteres'),
        
        body('profissionais.*.cargo')
            .optional()
            .isString()
            .withMessage('Cargo deve ser uma string')
            .trim()
            .isLength({ max: 100 })
            .withMessage('Cargo não pode exceder 100 caracteres'),
        
        body('profissionais.*.empresa')
            .optional()
            .isString()
            .withMessage('Empresa deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Empresa não pode exceder 200 caracteres'),
        
        body('profissionais.*.anoInicio')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage('Ano de início deve ser um ano válido'),
        
        body('profissionais.*.anoFim')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
            .withMessage('Ano de fim deve ser um ano válido'),
        
        body('profissionais.*.descricao')
            .optional()
            .isString()
            .withMessage('Descrição da experiência deve ser uma string')
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Descrição da experiência não pode exceder 1000 caracteres'),
        
        body('profissionais.*.isCurrent')
            .optional()
            .isBoolean()
            .withMessage('isCurrent deve ser um boolean'),
        
        body('profissionais.*.logoEmpresa')
            .optional()
            .isMongoId()
            .withMessage('Logo da empresa deve ser um ID MongoDB válido'),

        // pesquisa - opcional
        body('pesquisa')
            .optional()
            .isArray()
            .withMessage('Pesquisas deve ser um array'),
        
        body('pesquisa.*.titulo')
            .optional()
            .isString()
            .withMessage('Título da pesquisa deve ser uma string')
            .trim()
            .isLength({ max: 300 })
            .withMessage('Título da pesquisa não pode exceder 300 caracteres'),
        
        body('pesquisa.*.descricao')
            .optional()
            .isString()
            .withMessage('Descrição da pesquisa deve ser uma string')
            .trim()
            .isLength({ max: 2000 })
            .withMessage('Descrição da pesquisa não pode exceder 2000 caracteres'),
        
        body('pesquisa.*.ano')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
            .withMessage('Ano da pesquisa deve ser um ano válido'),
        
        body('pesquisa.*.link')
            .optional()
            .isURL()
            .withMessage('Link da pesquisa deve ser uma URL válida'),
        
        body('pesquisa.*.documento')
            .optional()
            .isMongoId()
            .withMessage('Documento da pesquisa deve ser um ID MongoDB válido'),
        
        body('pesquisa.*.cover')
            .optional()
            .isMongoId()
            .withMessage('Cover da pesquisa deve ser um ID MongoDB válido'),

        // habilidades - opcional
        body('habilidades')
            .optional()
            .isArray()
            .withMessage('Habilidades deve ser um array'),
        
        body('habilidades.*')
            .optional()
            .isString()
            .withMessage('Habilidade deve ser uma string')
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Habilidade deve ter entre 1 e 50 caracteres'),

        // certificacoes - opcional
        body('certificacoes')
            .optional()
            .isArray()
            .withMessage('Certificações deve ser um array'),
        
        body('certificacoes.*.nome')
            .optional()
            .isString()
            .withMessage('Nome da certificação deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Nome da certificação não pode exceder 200 caracteres'),
        
        body('certificacoes.*.instituicao')
            .optional()
            .isString()
            .withMessage('Instituição da certificação deve ser uma string')
            .trim()
            .isLength({ max: 200 })
            .withMessage('Instituição da certificação não pode exceder 200 caracteres'),
        
        body('certificacoes.*.ano')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() + 10 })
            .withMessage('Ano da certificação deve ser um ano válido'),
        
        body('certificacoes.*.descricao')
            .optional()
            .isString()
            .withMessage('Descrição da certificação deve ser uma string')
            .trim()
            .isLength({ max: 500 })
            .withMessage('Descrição da certificação não pode exceder 500 caracteres'),
        
        body('certificacoes.*.certificado')
            .optional()
            .isMongoId()
            .withMessage('Certificado deve ser um ID MongoDB válido'),

        // idiomas - opcional
        body('idiomas')
            .optional()
            .isArray()
            .withMessage('Idiomas deve ser um array'),
        
        body('idiomas.*.idioma')
            .optional()
            .isString()
            .withMessage('Nome do idioma deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('Nome do idioma deve ter entre 2 e 50 caracteres'),
        
        body('idiomas.*.nivel')
            .optional()
            .isIn(['Básico', 'Intermediário', 'Avançado', 'Fluente', 'Nativo'])
            .withMessage('Nível deve ser: Básico, Intermediário, Avançado, Fluente ou Nativo'),

        // interessesProfissionais - opcional
        body('interessesProfissionais')
            .optional()
            .isArray()
            .withMessage('Interesses profissionais deve ser um array'),
        
        body('interessesProfissionais.*')
            .optional()
            .isString()
            .withMessage('Interesse profissional deve ser uma string')
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Interesse profissional deve ter entre 1 e 100 caracteres'),

        // fotoPerfil - opcional
        body('fotoPerfil')
            .optional()
            .isMongoId()
            .withMessage('Foto de perfil deve ser um ID MongoDB válido'),

        // fotoCapa - opcional
        body('fotoCapa')
            .optional()
            .isMongoId()
            .withMessage('Foto de capa deve ser um ID MongoDB válido')
    ],

    // Validador para atualizar perfil
    update: [
        // ID do perfil
        param('id')
            .isMongoId()
            .withMessage('ID do perfil deve ser um MongoDB ID válido'),

        // Todos os campos são opcionais para update
        body('nomeReferencial')
            .optional()
            .isString()
            .withMessage('Nome referencial deve ser uma string')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Nome referencial deve ter entre 2 e 100 caracteres')
            .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
            .withMessage('Nome referencial pode conter apenas letras, espaços, hífens e apóstrofos'),

        body('username')
            .optional()
            .isString()
            .withMessage('Username deve ser uma string')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username pode conter apenas letras, números, hífens e sublinhados'),

        body('emailInstitucional')
            .optional()
            .isEmail()
            .withMessage('Formato de email inválido')
            .normalizeEmail()
            .isLength({ max: 200 })
            .withMessage('Email não pode exceder 200 caracteres'),

        // Reutilizar as mesmas validações do create para os campos opcionais
        ...handleValidatorProfile.create.filter(validator => 
            !['nomeReferencial', 'username', 'emailInstitucional'].some(field => 
                validator.builder && validator.builder.fields && validator.builder.fields.includes(field)
            )
        )
    ],

    // Validador para buscar perfil por ID
    getById: [
        param('id')
            .isMongoId()
            .withMessage('ID do perfil deve ser um MongoDB ID válido')
    ],

    // Validador para deletar perfil
    delete: [
        param('id')
            .isMongoId()
            .withMessage('ID do perfil deve ser um MongoDB ID válido')
    ],

    // Validador para buscar perfis com filtros
    getAll: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Página deve ser um número inteiro positivo'),
        
        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('Limite deve estar entre 1 e 100'),
        
        query('username')
            .optional()
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres'),
        
        query('search')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 100 })
            .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
        
        query('habilidade')
            .optional()
            .isString()
            .trim()
            .isLength({ min: 1, max: 50 })
            .withMessage('Habilidade deve ter entre 1 e 50 caracteres')
    ],

    // Validador para buscar perfil por username
    getByUsername: [
        param('username')
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage('Username deve ter entre 3 e 50 caracteres')
            .matches(/^[a-zA-Z0-9_-]+$/)
            .withMessage('Username pode conter apenas letras, números, hífens e sublinhados')
    ]
};