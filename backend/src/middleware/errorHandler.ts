import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const first = err.issues[0];
    const field = first.path.join(".");
    const msg = field ? `${field}: ${first.message}` : first.message;
    return res.status(400).json({ error: msg });
  }

  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status ?? 500;
    return res.status(status).json({ error: err.message });
  }

  res.status(500).json({ error: "Internal server error" });
}
