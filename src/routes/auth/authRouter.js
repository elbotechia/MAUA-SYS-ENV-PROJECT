import express from "express";
import { signUpValidator } from "../../validators/signUpValidator.js";
import { handleValidatorAuth } from "../../validators/authValidator.js";
import { validateResults } from "../../utils/handleValidator.js";
import { AuthController } from "../../controllers/auth/authController.js";

export class AuthRouter {
    constructor() {
        this.router = express.Router();
        this.authController = new AuthController();
        this.initRouter(); // ✅ Inicializar as rotas no constructor
    }

    initRouter() {
        // Rota POST para cadastro
        this.router.post('/sign-up', 
            signUpValidator.create, // ✅ Usar o array de validações correto
            this.authController.postSignUp.bind(this.authController)
        );

        // Rotas GET para teste e listagem
        this.router.get('/test', (req, res) => {
            res.json({ 
                success: true, 
                message: "Auth router funcionando!", 
                timestamp: new Date().toISOString() 
            });
        });

        // Rota para listar usuários (para teste)
        this.router.get('/users', this.authController.getUsers.bind(this.authController));
        
        // Rota para buscar usuário por ID
        this.router.get('/users/:id', this.authController.getUserById.bind(this.authController));

        // Temporariamente sem validações para debug
        this.router.post('/sign-in', 
            // handleValidatorAuth.signIn,
            // validateResults,
            this.authController.postSignIn.bind(this.authController)
        );

        this.router.post('/recovery',  this.authController.postRecoverPassword.bind(this.authController));
        // Log para debug
        console.log('🔐 AuthRouter inicializado com sucesso');
    }

    getRouter() {
        return this.router;
    }
}

// Export default para facilitar importação
export default AuthRouter;