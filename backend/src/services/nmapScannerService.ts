import { exec } from 'child_process';
import util from 'util';

// Promisify exec to use async/await
const execAsync = util.promisify(exec);

// Function to validate and run nmap scan
export const runNmapScan = async (ip: string, ports: string = "22-1024") => {
    if (!ip) {
        throw new Error('IP address must be provided');
    }

    try {
        // Execute the Nmap command
        const { stdout, stderr } = await execAsync(`nmap -p ${ports} ${ip}`);

        // If stderr contains an error, throw an exception
        if (stderr) {
            throw new Error(`Nmap Error: ${stderr}`);
        }

        // Parse Nmap output to extract open ports
        const openPorts = parseOpenPorts(stdout);

        return {
            target: ip,
            raw: stdout,
            open_ports: openPorts,
        };
    } catch (error: any) {
        throw new Error(`Scan failed: ${error.message}`);
    }
};

// Parse Nmap output to extract open ports
const parseOpenPorts = (nmapOutput: string) => {
    const lines = nmapOutput.split('\n');
    const openPorts = [];

    // Loop through each line in Nmap's output
    for (const line of lines) {
        // Match lines that describe open ports (e.g., "22/tcp open ssh")
        const match = line.match(/^(\d+)\/tcp\s+open\s+(\S+)/);

        if (match && match[1]) {
            openPorts.push({
                port: parseInt(match[1], 10), // Use base 10 for parseInt
                service: match[2],             // Service name (e.g., ssh)
            });
        }
    }

    // Return the list of open ports found
    return openPorts;
};
