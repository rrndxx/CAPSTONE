import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { JWT_SECRET, notificationService, TOKEN_EXPIRY } from "../server.js";

export async function login(email: string, password: string) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) throw new Error("User not found!");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid credentials!");

    await notificationService.notify({
        type: "LOGIN",
        message: `Admin ${email} logged in.`,
        severity: "INFO",
        interfaceId: 2,
        meta: { email },
    });

    const token = jwt.sign(
        { userId: user.userId, email: user.email },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY as import("ms").StringValue }
    );

    return { user: { userId: user.userId, email: user.email }, token };
}

export async function getUserFromToken(token: string) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId: number };
        return db.user.findUnique({ where: { userId: decoded.userId } });
    } catch {
        return null;
    }
}

export async function createAdmin(email: string, password: string) {
    const hashedPass = await bcrypt.hash(password, 10);
    return db.user.create({
        data: { email, password: hashedPass },
    });
}
