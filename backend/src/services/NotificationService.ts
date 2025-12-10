// src/NotificationService.ts
import { PrismaClient, AlertSeverity, AlertType, Prisma } from "@prisma/client";
import nodemailer from "nodemailer";
import webpush from "web-push";
import db from "../config/db.js";

/**
 * Notification input for triggering an alert
 */
export interface NotificationEvent {
    type: keyof typeof AlertType; // LOGIN, CONNECTED_DEVICES_RELATED, ACTION, BANDWIDTH_RELATED
    message: string;
    severity: keyof typeof AlertSeverity; // INFO, WARNING, CRITICAL
    interfaceId: number;
    meta?: Record<string, any>; // optional additional info (device, IP, etc.)
}

/**
 * Channel Interface
 */
interface Channel {
    send(event: NotificationEvent): Promise<void>;
}

/**
 * Email Channel Adapter (Nodemailer)
 */
export class EmailChannel implements Channel {
    private transporter;

    constructor(
        private recipients: string[]
    ) {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async send(event: NotificationEvent) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: this.recipients.join(","),
            subject: `[${event.severity}] ${event.type}`,
            text: event.message,
            html: `<p>${event.message}</p>`,
        };
        await this.transporter.sendMail(mailOptions);
    }
}

/**
 * Browser Push Notification Adapter
 */
export class PushChannel implements Channel {
    constructor(
        private vapidDetails: { subject: string; publicKey: string; privateKey: string },
        private db: PrismaClient
    ) {
        webpush.setVapidDetails(
            vapidDetails.subject,
            vapidDetails.publicKey,
            vapidDetails.privateKey
        );
    }

    async addSubscription(subscription: webpush.PushSubscription, userId?: number) {
        const { endpoint, keys } = subscription;

        if (!endpoint || !keys) {
            throw new Error("Invalid push subscription object");
        }

        await db.pushSubscription.upsert({
            where: { endpoint },
            create: {
                endpoint,
                keysAuth: keys.auth,
                keysP256dh: keys.p256dh,
                userId: userId ?? null,
            },
            update: {
                keysAuth: keys.auth,
                keysP256dh: keys.p256dh,
                userId: userId ?? null,
            },
        });
    }

    async send(event: NotificationEvent) {
        const payload = JSON.stringify({
            title: `[${event.severity}] ${event.type}`,
            body: event.message,
            data: event.meta,
        });

        const subs = await db.pushSubscription.findMany();

        for (const sub of subs) {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: { auth: sub.keysAuth, p256dh: sub.keysP256dh },
                    },
                    payload
                );
            } catch (err: any) {
                console.error("Push notification failed:", err?.message || err);

                if (err.statusCode === 410 || err.statusCode === 404) {
                    await db.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
                    console.log(`Deleted expired subscription: ${sub.endpoint}`);
                }
            }
        }
    }
}

/**
 * Alert Repository (Postgres via Prisma)
 */
export class AlertRepository {
    constructor(
        private prisma: PrismaClient
    ) { }

    async save(event: NotificationEvent) {
        return this.prisma.alert.create({
            data: {
                alertType: event.type,
                message: event.message,
                severity: event.severity,
                interfaceId: event.interfaceId,
                timestamp: new Date(),
            },
        });
    }

    async getRecent(limit: number) {
        const alerts = await this.prisma.alert.findMany({
            orderBy: { timestamp: "desc" },
            take: 250,
        });

        return alerts.map(alert => ({
            type: alert.alertType,
            message: alert.message,
            severity: alert.severity,
            interfaceId: alert.interfaceId,
            meta: undefined,
            time: alert.timestamp
        })) as unknown as NotificationEvent[];
    }
}

/**
 * Notification Service
 */
export class NotificationService {
    private channels: Channel[];

    constructor(
        channels: Channel[],
        private repository: AlertRepository
    ) {
        this.channels = channels;
    }

    /**
     * Trigger an alert
     */
    async notify(event: NotificationEvent) {
        await this.repository.save(event);

        // Send via all channels
        for (const channel of this.channels) {
            try {
                await channel.send(event);
            } catch (err) {
                console.error("Notification send failed:", err);
            }
        }
    }

    /**
     * Fetch recent alerts for UI
     */
    async getRecent(limit = 50): Promise<NotificationEvent[]> {
        return this.repository.getRecent(limit);
    }
}
