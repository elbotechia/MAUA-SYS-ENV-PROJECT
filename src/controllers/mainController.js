import { handleHttpError } from "../errors/handleError.js";

export class MainController {
    constructor() {

    }


    async getIndex(req, res){
        try {
            res.sendFile("index.html", { root: "public" });
        } catch (error) {
         handleHttpError(res, 'ERROR_GET_INDEX', 500);
        }
    }

  
}