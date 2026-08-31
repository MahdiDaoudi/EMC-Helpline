import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    let body = req.body ?? {};

    if (body && typeof body === "object") {
      const rawString =
        typeof (body as any).data === "string"
          ? (body as any).data
          : typeof (body as any).payload === "string"
          ? (body as any).payload
          : null;

      if (rawString) {
        try {
          body = JSON.parse(rawString);
        } catch {
          return res.status(400).json({
            message: "Invalid JSON data",
          });
        }
      }
    }

    if (!body || typeof body !== "object") {
      body = {};
    }

    const result = schema.safeParse(body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        error: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;

    next();
  };
}
