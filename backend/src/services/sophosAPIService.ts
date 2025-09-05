import axios, { type AxiosInstance } from "axios";
import FormData from "form-data";
import https from "https";

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
        rejectUnauthorized: false,
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

  async addIPHost(name: string, ip: string): Promise<string> {
    const form = this.buildForm(`
      <Set operation="add">
        <IPHost>
          <Name>${name}</Name>
          <IPFamily>IPv4</IPFamily>
          <HostType>IP</HostType>
          <IPAddress>${ip}</IPAddress>
        </IPHost>
      </Set>
    `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async updateIPHost(name: string, ip: string): Promise<string> {
    const form = this.buildForm(`
    <Set operation="update">
      <IPHost>
        <Name>${name}</Name>
        <IPFamily>IPv4</IPFamily>
        <HostType>IP</HostType>
        <IPAddress>${ip}</IPAddress>
      </IPHost>
    </Set>
  `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async deleteIPHost(name: string): Promise<string> {
    const form = this.buildForm(`
      <Remove>
        <IPHost>
          <Name>${name}</Name>
        </IPHost>
      </Remove>
    `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async getMACHosts(): Promise<string> {
    const form = this.buildForm(`
    <Get>
      <MACHost></MACHost>
    </Get>
  `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async getZones(): Promise<string> {
    const form = this.buildForm(`
    <Get>
      <Zone></Zone>
    </Get>
  `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async getServices(): Promise<string> {
    const form = this.buildForm(`
    <Get>
      <Services></Services>
    </Get>
  `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async getFirewallRules(): Promise<string> {
    const form = this.buildForm(`
      <Get>
        <FirewallRule></FirewallRule>
      </Get>
    `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async addFirewallRule(
    name: string,
    sourceHost: string,
    action: "Accept" | "Drop" = "Drop",
    position: "Top" | "Bottom" = "Top",
    policyType: "Network" | "User" = "Network",
    sourceZone: "LAN" | "WAN" | "DMZ" = "LAN",
    destinationZone: "LAN" | "WAN" | "DMZ" = "WAN",
    service: string = "Any"
  ): Promise<string> {
    const form = this.buildForm(`
    <Set operation="add">
      <FirewallRule>
        <Name>${name}</Name>
        <Description>Rule created via API</Description>
        <PolicyType>${policyType}</PolicyType>
        <Position>${position}</Position>

        <SourceZones>
          <Zone>${sourceZone}</Zone>
        </SourceZones>
        <SourceNetworks>
          <Network>${sourceHost}</Network>
        </SourceNetworks>

        <DestinationZones>
          <Zone>${destinationZone}</Zone>
        </DestinationZones>
        <DestinationNetworks>
          <Network>Any</Network>
        </DestinationNetworks>

        <Services>
          <Service>${service}</Service>
        </Services>

        <Action>${action}</Action>
        <Status>Enable</Status>
      </FirewallRule>
    </Set>
  `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async updateFirewallRule(
    name: string,
    sourceHost: string,
    action: "Accept" | "Drop" = "Drop",
    position: "Top" | "Bottom" = "Top",
    policyType: "Network" | "User" = "Network",
    sourceZone: "LAN" | "WAN" | "DMZ" = "LAN",
    destinationZone: "WAN" | "LAN" | "DMZ" = "WAN",
    service: string = "Any"
  ): Promise<string> {
    const form = this.buildForm(`
    <Set operation="update">
      <FirewallRule>
        <Name>${name}</Name>
        <Description>Updated via API</Description>
        <PolicyType>${policyType}</PolicyType>
        <Position>${position}</Position>

        <SourceZones>
          <Zone>${sourceZone}</Zone>
        </SourceZones>
        <SourceNetworks>
          <Network>${sourceHost}</Network>
        </SourceNetworks>

        <DestinationZones>
          <Zone>${destinationZone}</Zone>
        </DestinationZones>
        <DestinationNetworks>
          <Network>Any</Network>
        </DestinationNetworks>

        <Services>
          <Service>${service}</Service>
        </Services>

        <Action>${action}</Action>
        <Status>Enable</Status>
      </FirewallRule>
    </Set>
  `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

  async deleteFirewallRule(name: string): Promise<string> {
    const form = this.buildForm(`
    <Remove>
      <FirewallRule>
        <Name>${name}</Name>
      </FirewallRule>
    </Remove>
  `);

    const res = await this.client.post("/webconsole/APIController", form, {
      headers: form.getHeaders(),
    });

    return res.data;
  }

}


