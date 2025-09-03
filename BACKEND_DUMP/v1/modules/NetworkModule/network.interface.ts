export interface INetworkRepository {
    performSpeedTest(): Promise<{ download: number; upload: number; ping: number; }>;
    getNetworkUsageStats(): Promise<{ timestamp: string; usageMbps: number }[]>;
    getNetworkInfo(): Promise<any>
}