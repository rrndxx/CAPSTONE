export interface DeviceModel {
    deviceId: number;
    mac: string;
    ip: string[];
    state: "UP" | "DOWN" | string;
    name: string;
    type?: "MOBILE" | "LAPTOP" | "ROUTER" | string;
    make?: string;
    model?: string;
    first_seen: string;
}

export interface NetworkScan {
    networkId: string;
    devices: DeviceModel[]
}