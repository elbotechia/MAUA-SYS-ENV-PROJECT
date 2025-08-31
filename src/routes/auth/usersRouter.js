import express from "express";
import { UsersControllers } from "../../controllers/auth/usersController.js";
class UsersRouter {
    constructor() {
        this.router = express.Router();
        this.usersController = new UsersControllers();
        this.initRouter();
    }

    initRouter() {
        // ✅ Correção: usar os nomes corretos dos métodos do controller
        this.router.get('/sign-in', this.usersController.getSignInPage.bind(this.usersController));
        this.router.get('/sign-up', this.usersController.getSignUpPage.bind(this.usersController));
        this.router.get('/recovery', this.usersController.getRecoveryPage.bind(this.usersController));
    }

    getRouter() {
        return this.router;
    }
}

export default UsersRouter;