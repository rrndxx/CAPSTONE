// sophosAPIService.ts
import axios, { type AxiosInstance } from "axios";
import FormData from "form-data";
import https from "https"; // ✅ use import, not require

interface SophosConfig {
    baseUrl: string;
    username: string;
    password: string;
}

export class SophosAPI {
    private client: AxiosInstance;
    private config: SophosConfig;

    constructor(config: SophosConfig) {
        this.config = config;
        this.client = axios.create({
            baseURL: this.config.baseUrl,
            validateStatus: () => true,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false, // ✅ self-signed certs won’t block us
            }),
        });
    }

    private buildForm(innerXml: string): FormData {
        const xml = `
      <Request>
        <Login>
          <Username>${this.config.username}</Username>
          <Password>${this.config.password}</Password>
        </Login>
        ${innerXml}
      </Request>
    `;

        const form = new FormData();
        form.append("reqxml", xml);
        return form;
    }

    async getIPHosts(): Promise<string> {
        const form = this.buildForm(`
      <Get>
        <IPHost></IPHost>
      </Get>
    `);

        const res = await this.client.post("/webconsole/APIController", form, {
            headers: form.getHeaders(),
        });

        return res.data;
    }

    async getIPHostStatistics(): Promise<string> {
        const form = this.buildForm(`
      <Get>
        <IPHostStatistics></IPHostStatistics>
      </Get>
    `);

        const res = await this.client.post("/webconsole/APIController", form, {
            headers: form.getHeaders(),
        });

        return res.data;
    }
}
