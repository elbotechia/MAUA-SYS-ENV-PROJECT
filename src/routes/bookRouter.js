import { BookController } from "../controllers/bookController.js";
import { Router } from "express";
import { uploadBookFiles } from "../middlewares/upload.js";

export class BookRouter {
    constructor() {
        this.router = Router();
        this.bookController = new BookController();
        this.initializeRoutes();
    }

    initializeRoutes() {
        // Rotas de visualização
        this.router.get("/", this.bookController.getBooks.bind(this.bookController));
        this.router.get("/new", this.bookController.getCreateForm.bind(this.bookController)); // Formulário de criação
        this.router.get("/:id", this.bookController.getBookById.bind(this.bookController));
        this.router.get("/:id/edit", this.bookController.getEditForm.bind(this.bookController)); // Formulário de edição
        
        // Rotas de ação com upload
        this.router.post("/create", uploadBookFiles, this.bookController.createBook.bind(this.bookController));
        this.router.put("/:id", uploadBookFiles, this.bookController.updateBook.bind(this.bookController));
        this.router.delete("/:id", this.bookController.deleteBook.bind(this.bookController));

        // Funcionalidades extras
        this.router.post("/:id/comment", this.bookController.addComment.bind(this.bookController));
        this.router.post("/:id/rating", this.bookController.addRating.bind(this.bookController));
        this.router.get("/:id/download", this.bookController.downloadBook.bind(this.bookController));
    }

    getRouter() {
        return this.router;
    }
}

