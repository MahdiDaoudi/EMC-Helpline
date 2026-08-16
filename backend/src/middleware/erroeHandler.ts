import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";

export async function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(err.message);
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV !== "production" && {
      error: err.message,
      stack: err.stack,
    }),
  });
}
