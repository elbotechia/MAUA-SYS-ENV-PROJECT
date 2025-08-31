import express from "express";
import { StorageController } from "../controllers/storageController.js";
import { uploadMiddleware } from "../../config/multer.js";
import { validatorDeleteItem, validatorGetItem } from "../validators/storage.js";

export class StorageRouter {
    constructor() {
        this.router = express.Router();
        this.storageController = new StorageController();
        this.initRouter();
    }

    initRouter() {
        // single para 1 upload, multi para varios uploads
        this.router.post(
            '/',
            uploadMiddleware.single('inputFile'),
            this.storageController.createItem.bind(this.storageController)
        );

        this.router.get('/', this.storageController.getItems.bind(this.storageController));          
        this.router.get('/:id', validatorGetItem, this.storageController.getItem.bind(this.storageController));
        this.router.delete('/:id', validatorDeleteItem, this.storageController.deleteItem.bind(this.storageController));
    }

    getRouter() {
        return this.router;
    }
}

