import { matchedData } from "express-validator";
import { handleHttpError } from "../errors/handleError.js";
import { Storage } from "../models/schemas/storage.js";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const PUBLIC_URL = process.env.BASE_URL || "http://localhost:3003/";

export class StorageController {
    /** GET obtem lista de items **/
    async getItems(req, res) {
        try {
           
            if (!Storage) {
                return res.status(500).json({ message: "Modelo Track não encontrado." });
            }
            // Busca todos os items track do banco de dados
            const data = await Storage.find();
            res.status(200).json(data);
        } catch (error) {
            handleHttpError(res, "ERROR_GET_ITEMS", error);   
        }
    }

    async getItem(req, res) {
        try {
            const {id} = matchedData(req);
            const data = await models.Storage.findById(id);
            if (!data) {
                return res.status(404).json({ message: "Item not found." });
            }
            res.status(200).json({ data });
        } catch (error) {
            handleHttpError(res, "ERROR_GET_ITEM", error);
        }
    }

    async createItem(req, res) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded." });
            }
            console.log(file);

            const fileData = {
                url: `${PUBLIC_URL}${file.filename}`,
                filename: file.filename
            };
            const data = await Storage.create(fileData);
            res.status(201).json({ data });

        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "500: Internal Server Error" });
        }
    }

    async deleteItem(req, res) {
        try {
            const id = req.params.id || matchedData(req).id;
            const data = await models.Storage.findByIdAndDelete(id);
            if (!data) {
                return res.status(404).json({ message: "Item not found." });
            }
            const { filename } = data;
            const filePath = `${process.env.STORAGE_PATH}/${filename}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            res.status(200).json({ message: "Item deleted successfully." });
        } catch (error) {
            handleHttpError(res, "ERROR_DELETE_ITEM", error);
        }
    }
}