import { body } from 'express-validator';

export const handleValidatorAuth = {
    // Validador para signIn
    signIn: [
        body('identify')
            .optional()
            .isString()
            .withMessage('Identify deve ser uma string')
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage('Identify deve ter entre 3 e 200 caracteres'),

        body('identifier')
            .optional()
            .isString()
            .withMessage('Identifier deve ser uma string')
            .trim()
            .isLength({ min: 3, max: 200 })
            .withMessage('Identifier deve ter entre 3 e 200 caracteres'),

        body('password')
            .notEmpty()
            .withMessage('Senha é obrigatória')
            .isString()
            .withMessage('Senha deve ser uma string')
            .isLength({ min: 1 })
            .withMessage('Senha não pode estar vazia'),

        // Validação customizada para garantir que pelo menos um dos campos de identificação existe
        body().custom((value, { req }) => {
            const { identify, identifier } = req.body;
            if (!identify && !identifier) {
                throw new Error('Email ou username é obrigatório (identify ou identifier)');
            }
            return true;
        })
    ],

    // Validador para signUp
    signUp: [
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

        body('emailInstitucional')
            .notEmpty()
            .withMessage('Email institucional é obrigatório')
            .isEmail()
            .withMessage('Formato de email inválido')
            .normalizeEmail()
            .isLength({ max: 200 })
            .withMessage('Email não pode exceder 200 caracteres'),

        body('password')
            .notEmpty()
            .withMessage('Senha é obrigatória')
            .isString()
            .withMessage('Senha deve ser uma string')
            .isLength({ min: 8, max: 128 })
            .withMessage('Senha deve ter entre 8 e 128 caracteres')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),

        body('role')
            .optional()
            .isIn(['user', 'admin', 'moderator'])
            .withMessage('Role deve ser: user, admin ou moderator'),

        body('tipo')
            .optional()
            .isIn(['PF', 'PJ'])
            .withMessage('Tipo deve ser: PF ou PJ')
    ],

    // Validador para alterar senha
    changePassword: [
        body('currentPassword')
            .notEmpty()
            .withMessage('Senha atual é obrigatória')
            .isString()
            .withMessage('Senha atual deve ser uma string'),

        body('newPassword')
            .notEmpty()
            .withMessage('Nova senha é obrigatória')
            .isString()
            .withMessage('Nova senha deve ser uma string')
            .isLength({ min: 8, max: 128 })
            .withMessage('Nova senha deve ter entre 8 e 128 caracteres')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial')
    ]
};