import { tokenVerify } from "../utils/handleJWT.js";
import { User } from "../models/schemas/user.js";

/**
 * Middleware para verificar token JWT
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token de acesso requerido",
                error: "MISSING_TOKEN"
            });
        }

        const decoded = await tokenVerify(token);
        
        if (!decoded) {
            return res.status(403).json({
                success: false,
                message: "Token inválido ou expirado",
                error: "INVALID_TOKEN"
            });
        }

        // Verificar se o usuário ainda existe e está ativo
        const user = await User.findById(decoded.id).select('isActive');
        
        if (!user || !user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Usuário não encontrado ou inativo",
                error: "USER_INACTIVE"
            });
        }

        req.user = decoded;
        next();

    } catch (error) {
        console.error("Erro na autenticação:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno na autenticação",
            error: "AUTH_ERROR"
        });
    }
};

/**
 * Middleware para verificar roles específicas
 */
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Usuário não autenticado",
                error: "UNAUTHORIZED"
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Acesso negado. Permissões insuficientes",
                error: "INSUFFICIENT_PERMISSIONS",
                requiredRoles: allowedRoles,
                userRole
            });
        }

        next();
    };
};

/**
 * Middleware para verificar se o usuário é admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware para verificar se o usuário é admin ou moderator
 */
export const requireModeratorOrAdmin = requireRole(['admin', 'moderator']);