import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";

export function validate(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    let body = req.body ?? {};

    if (
      body &&
      typeof body === "object" &&
      typeof (body as any).data === "string"
    ) {
      try {
        body = JSON.parse((body as any).data);
      } catch {
        return res.status(400).json({
          message: "Invalid JSON data",
        });
      }
    }

    if (!body || typeof body !== "object") {
      body = {};
    }

    console.log("VALIDATION BODY:", body);

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
