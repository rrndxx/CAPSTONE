import type { Request as ExpressRequest, Response as ExpressResponse, NextFunction as ExpressNext } from "express";
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../server.js";

export function authMiddleware(req: ExpressRequest, res: ExpressResponse, next: ExpressNext) {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: "No web token" })

    const token = authHeader.split(" ")[1]
    if (!token) return res.status(401).json({ error: "No web token" })

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId: number };
        (req as any).user = decoded;
        next()
    } catch (err: any) {
        return res.status(401).json({ error: err.message })
    }
}