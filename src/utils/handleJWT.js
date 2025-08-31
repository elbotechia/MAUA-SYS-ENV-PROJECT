import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { handleHttpError } from '../errors/handleError.js';
dotenv.config();
const JWT_SECRET = process.env.JWT_KEY || 'fallback-secret-key-for-development';

export const tokenSignIn = async ({userObj})=>{
    try {
        const sign = jwt.sign({
            id: userObj.id,
            username: userObj.username,
            email: userObj.email,
            role: userObj.role,
            tipo: userObj.tipo,
            profileId: userObj.profileId
        }, JWT_SECRET, {
            expiresIn: '2h'
        })

        return sign

        
    } catch (error) {
        console.error("ERROR_SIGN_IN_TOKEN:", error);
        throw new Error("Error signing in: " + error.message);
    }
}


export const tokenVerify = async (token) => {
    try {
        const decoded = await jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}