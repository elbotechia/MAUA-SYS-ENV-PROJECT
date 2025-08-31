import path from "path";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();

const PATH_2_VIEWS = process.env.VIEWS_DIRECTORY || path.resolve("views")
const PATH_2_JSON = process.env.JSON_DIRECTORY||"DATA/JSON"
const JSON_PAGES = path.resolve(PATH_2_JSON, 'pages.json');
const JSON_USERS = path.resolve(PATH_2_JSON, 'users.json');

export class UsersControllers {  

    async getSignInPage(req, res) {
        try {
            const pages = JSON.parse(fs.readFileSync(JSON_PAGES, 'utf-8'));
            res.render("pages/users", { page: pages.find(page => page.id === "signin") });
        } catch (error) {
            throw new Error(`Error in MainController.getMain: ${error.message}`);
        }
    }

    async getSignUpPage(req, res) {
        try {
            const pages = JSON.parse(fs.readFileSync(JSON_PAGES, 'utf-8'));
            res.render("pages/users", { page: pages.find(page => page.id === "signup") });
        } catch (error) {
            throw new Error(`Error in MainController.getMain: ${error.message}`);
        }
    }

    async getRecoveryPage(req, res) {
        try {
            const pages = JSON.parse(fs.readFileSync(JSON_PAGES, 'utf-8'));
            res.render("pages/users", { page: pages.find(page => page.id === "recovery") });
        } catch (error) {
            throw new Error(`Error in MainController.getMain: ${error.message}`);
        }
    }
}