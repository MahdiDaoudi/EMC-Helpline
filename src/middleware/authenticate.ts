import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../types/jwt';

export function authenticate(){
    return (
        req:Request,
        res:Response,
        next:NextFunction
    )=>{
        const authHeader = req.headers.authorization;
        if(!authHeader?.startsWith('Bearer ')){
            return res.status(401).json({
                message: "Authorization header is missing"
            })
        }
        const token = authHeader!.substring(7);
        try {
            const payload: JwtPayload = jwt.verify(token,env.secretKey) as JwtPayload;
            req.user = payload
            next()
        } catch {
            return res.status(401).json({
                message: "Authorization denied"
            })
        }
    }
}