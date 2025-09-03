import snmp from "net-snmp";

// SNMPv3 session options
const options = {
    port: 161,
    version: snmp.Version3,
    idBitsSize: 32,
    context: "",
    security: {
        level: snmp.SecurityLevel.authPriv,
        authProtocol: snmp.AuthProtocols.sha256,
        authKey: "Netdetect@2025auth", // same as Sophos config
        privProtocol: snmp.PrivProtocols.aes,
        privKey: "Netdetect@2025enc",  // same as Sophos config
        engineID: null,
        name: "admin"              // SNMPv3 username
    }
};

// Create SNMP session to Sophos firewall IP
const target = "172.16.16.16"; // firewall LAN IP
const session = snmp.createSession(target, "", options);

// Walk ARP table OIDs
const arpIP_OID = "1.3.6.1.2.1.4.22.1.3";
const arpMAC_OID = "1.3.6.1.2.1.4.22.1.2";

function walkOID(oid: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        session.subtree(oid, (varbinds) => {
            varbinds.forEach(vb => {
                if (snmp.isVarbindError(vb)) {
                    console.error(snmp.varbindError(vb));
                } else {
                    results.push({ oid: vb.oid, value: vb.value });
                }
            });
        }, (error) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

async function getConnectedDevices() {
    try {
        const ips = await walkOID(arpIP_OID);
        const macs = await walkOID(arpMAC_OID);

        const devices = ips.map((ipEntry, index) => ({
            ip: ipEntry.value.toString(),
            mac: macs[index] ? Buffer.from(macs[index].value).toString("hex").match(/.{1,2}/g)?.join(":") : "unknown"
        }));

        console.log("Connected devices:", devices);
    } catch (err) {
        console.error("SNMP error:", err);
    } finally {
        session.close();
    }
}

getConnectedDevices();
