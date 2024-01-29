import { type NextFunction, type Request, type Response } from "express";

export function checkSessionIdExists(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const sessionId = request.cookies.sessionId;

  if (!sessionId) {
    response.status(401).json({
      error: "Unauthorized",
    });
  }

  next();
}
