import { Request, Response, NextFunction } from "express";
import { error } from "node:console";
import { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny){
    return (req:Request, res:Response, next:NextFunction)=>{
        const result = schema.safeParse(req.body);
        if(!result.success){
            return res.status(400).json({
                message: "Validation failed",
                error: result.error.flatten().fieldErrors,
            })
        }
        req.body = result.data;
        next();
    }

}