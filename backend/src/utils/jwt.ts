import jwt from "jsonwebtoken";
import {env} from '../config/env'

export function generateAccessToken(userId:number, role:string){
    return jwt.sign(
        {
            userId:userId,
            role:role
        },
        env.secretKey,
        {
            expiresIn:"1d"
        }
    )
}