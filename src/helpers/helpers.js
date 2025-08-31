import fs from 'fs'
import dotenv from  'dotenv'
import path from  'path'  


export const jsonReader = async(option)=>{
    dotenv.config()
    const PATH_2_JSON = await process.env.JSON_DIRECTORY||"DATA/JSON"
    const JSON_OPTION = await path.resolve(PATH_2_JSON, `${option}.json`);
    const DATA = await fs.promises.readFile(JSON_OPTION, 'utf-8');  
    if(DATA){
        return JSON.parse(DATA);
    }
    else{
        throw new Error('Error to read JSON file')
    }

}