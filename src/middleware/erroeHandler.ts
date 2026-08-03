import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

export async function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    if(err instanceof ApiError){
        return res.status(err.statusCode).json({
            message:err.message
        });
    }

    return res.status(500).json({
        message: "Internal server error",
    })
}