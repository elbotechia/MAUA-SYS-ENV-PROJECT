import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { MainRouter } from '../routes/mainRouter.js';
import dbConnect from '../../config/mongoose.js';
import { db } from '../../config/knex.js';
import { DatabaseSetup } from '../utils/databaseSetup.js';
import expressEjsLayouts from 'express-ejs-layouts';
import { BookRouter } from '../routes/bookRouter.js';
import {AuthRouter} from '../routes/auth/authRouter.js'
import { StorageRouter } from '../routes/storageRouter.js';
dotenv.config();

export class Server{

    constructor(){
        this.app = express();
        this.port = Number(process.env.PORT) || 3000;
        this.mainPath="/"
        this.expressEjsLayouts = expressEjsLayouts;
        this.mainRouter= new MainRouter();
        this.bookPath="/books"
        this.bookRouter = new BookRouter();
        this.authPath="/auth",
        this.authRouter = new AuthRouter();
        this.storagePath="/uploads"
        this.storageRouter= new StorageRouter()
   
    }

    async initialize() {
        dbConnect();
        // CORS
        this.app.use(cors());

        // Body parser
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true })); // ✅ Adicionar para formulários

        // Morgan for logging
        this.app.use(morgan('dev'));

        // Serve static files
        this.app.use(express.static(path.resolve('public')));
        this.app.use('/uploads', express.static(path.resolve('uploads')));
        this.app.use(express.static(path.resolve('UPLOADS')));

     //   this.app.set("views", path.resolve("views"));
        //this.app.set("view engine", "ejs");
//this.app.use(this.expressEjsLayouts);
    //   // this.app.set('layout', 'layout'); // ou outro nome, sem .ejs
//        this.app.set('layout extractScripts', true); // opcional

    }


    routes(){
        this.app.use(this.mainPath, this.mainRouter.getRouter());
        this.app.use(this.bookPath, this.bookRouter.getRouter());
        this.app.use(this.authPath, this.authRouter.getRouter());
        this.app.use(this.storagePath, this.storageRouter.getRouter());
    }


    listen(){
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }

}