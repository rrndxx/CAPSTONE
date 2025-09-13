from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import nmap
import asyncio
from concurrent.futures import ThreadPoolExecutor
import speedtest
import platform
import subprocess
import re
import json

try:
    import netifaces  
    HAS_NETIFACES = True
except Exception:
    HAS_NETIFACES = False

app = FastAPI(title="Network Scanner API")

nm = nmap.PortScanner()
executor = ThreadPoolExecutor()

# ----- Models -----

class PortInfo(BaseModel):
    port: int
    state: str
    name: Optional[str] = None
    product: Optional[str] = None
    version: Optional[str] = None

class PortScanResult(BaseModel):
    ip: str
    ports: List[PortInfo]

class OSScanResult(BaseModel):
    ip: str
    os: Optional[str] = None
    accuracy: Optional[str] = None
    
class SpeedTestResult(BaseModel):
    isp: Optional[str] = None
    client_ip: Optional[str] = None
    server: Optional[dict] = None
    ping_ms: Optional[float] = None
    download_bps: Optional[float] = None
    upload_bps: Optional[float] = None
    timestamp: Optional[str] = None

class PingSummary(BaseModel):
    target: str
    transmitted: Optional[int] = None
    received: Optional[int] = None
    packet_loss_pct: Optional[float] = None
    avg_rtt_ms: Optional[float] = None
    raw_output: Optional[str] = None

class ISPHealthResult(BaseModel):
    isp: Optional[str] = None
    speedtest: Optional[SpeedTestResult] = None
    pings: List[PingSummary] = Field(default_factory=list)
    notes: Optional[str] = None

# ----- Helper functions -----

async def run_nmap_scan(ip: str, ports: str = "22-1024", args: str = "-sS") -> nmap.PortScanner:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, lambda: nm.scan(ip, ports, arguments=args))

def _run_speedtest_blocking():
    """Blocking speedtest operation (executed in threadpool)."""
    s = speedtest.Speedtest()
    s.get_best_server()  
    download = s.download()
    try:
        upload = s.upload(pre_allocate=False)
    except Exception:
        upload = None

    results = s.results.dict()
    return {
        "isp": results.get("client", {}).get("isp"),
        "client_ip": results.get("client", {}).get("ip"),
        "server": results.get("server"),
        "ping_ms": results.get("ping"),
        "download_bps": results.get("download"),
        "upload_bps": results.get("upload"),
        "timestamp": results.get("timestamp"),
        "raw": results,
    }

async def run_speedtest() -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, _run_speedtest_blocking)

def _ping_blocking(host: str, count: int = 4, timeout_s: int = 5) -> dict:
    """Ping host and return packet loss and average RTT."""
    system = platform.system().lower()
    if system == "windows":
        cmd = ["ping", "-n", str(count), "-w", str(int(timeout_s * 1000)), host]
    else:
        cmd = ["ping", "-c", str(count), host]

    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=(timeout_s * (count + 1)))
        out = proc.stdout + proc.stderr
    except subprocess.TimeoutExpired as e:
        out = f"timeout: {str(e)}"
        return {"target": host, "transmitted": count, "received": 0, "packet_loss_pct": 100.0, "avg_rtt_ms": None, "raw_output": out}

    packet_loss = None
    transmitted = None
    received = None
    avg_rtt = None

    # Linux/macOS format
    m = re.search(r"(\d+)\s+packets transmitted.*?(\d+)\s+received.*?(\d+)%\s+packet loss", out, re.S)
    if m:
        transmitted = int(m.group(1))
        received = int(m.group(2))
        packet_loss = float(m.group(3))
    else:
        # Windows format
        m2 = re.search(r"Sent\s*=\s*(\d+).*Received\s*=\s*(\d+).*Lost\s*=\s*(\d+).*?(\d+)%", out, re.S)
        if m2:
            transmitted = int(m2.group(1))
            received = int(m2.group(2))
            packet_loss = float(m2.group(4))
        else:
            m3 = re.search(r"(\d+)%\s*packet loss", out)
            if m3:
                packet_loss = float(m3.group(1))

    # RTT parsing
    m4 = re.search(r"rtt .* = .*?/([0-9.]+)/", out)
    if m4:
        try:
            avg_rtt = float(m4.group(1))
        except Exception:
            avg_rtt = None
    else:
        m5 = re.search(r"Average\s*=\s*([0-9]+)ms", out)
        if m5:
            try:
                avg_rtt = float(m5.group(1))
            except Exception:
                avg_rtt = None

    return {"target": host, "transmitted": transmitted, "received": received, "packet_loss_pct": packet_loss, "avg_rtt_ms": avg_rtt, "raw_output": out}

async def run_ping(host: str, count: int = 4, timeout_s: int = 5) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, lambda: _ping_blocking(host, count, timeout_s))

def try_get_default_gateway() -> Optional[str]:
    if not HAS_NETIFACES:
        return None
    try:
        gws = netifaces.gateways()
        default = gws.get('default', {})
        gw = default.get(netifaces.AF_INET)
        if gw:
            return gw[0]
    except Exception:
        pass
    return None

# ----- Endpoints -----

@app.get("/scan_ports/", response_model=PortScanResult)
async def scan_ports(ip: str, ports: str = "22-1024"):
    try:
        await run_nmap_scan(ip, ports, args='-sS')
        
        if ip not in nm.all_hosts():
            return {"ip": ip, "ports": []}

        ports_info = []
        
        for proto in nm[ip].all_protocols():
            for port in nm[ip][proto]:
                port_data = nm[ip][proto][port]
                ports_info.append(PortInfo(
                    port=port,
                    state=port_data["state"],
                    name=port_data.get("name"),
                    product=port_data.get("product"),
                    version=port_data.get("version"),
                ))

        return {"ip": ip, "ports": ports_info}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/detect_os/", response_model=OSScanResult)
async def detect_os(ip: str):
    try:
        await run_nmap_scan(ip, args='-O -sS')

        if ip not in nm.all_hosts():
            return {"ip": ip, "os": None, "accuracy": None}

        osmatch = nm[ip].get("osmatch", [])
        if osmatch:
            return {
                "ip": ip,
                "os": osmatch[0]["name"],
                "accuracy": osmatch[0]["accuracy"]
            }
        else:
            return {"ip": ip, "os": None, "accuracy": None}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/speedtest/", response_model=SpeedTestResult)
async def speedtest_run():
    try:
        res = await run_speedtest()
        return {
            "isp": res.get("isp"),
            "client_ip": res.get("client_ip"),
            "server": res.get("server"),
            "ping_ms": res.get("ping_ms"),
            "download_bps": res.get("download_bps"),
            "upload_bps": res.get("upload_bps"),
            "timestamp": res.get("timestamp"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Speedtest failed: {e}")

@app.get("/isp_health/", response_model=ISPHealthResult)
async def isp_health(check_gateway: bool = True):
    try:
        st = await run_speedtest()
    except Exception as e:
        st = {"error": f"speedtest failed: {e}"}

    pings = []

    try:
        server_host = st.get("server", {}).get("host") if isinstance(st.get("server"), dict) else None
        if server_host:
            try:
                pings.append(await run_ping(server_host))
            except Exception as e:
                pings.append({"target": server_host, "error": str(e)})
    except Exception:
        pass

    for host in ["8.8.8.8", "1.1.1.1"]:
        try:
            pings.append(await run_ping(host))
        except Exception as e:
            pings.append({"target": host, "error": str(e)})

    gateway = None
    if check_gateway:
        try:
            gw = try_get_default_gateway()
            if gw:
                gateway = gw
                try:
                    pings.insert(0, await run_ping(gateway))
                except Exception as e:
                    pings.insert(0, {"target": gateway, "error": str(e)})
        except Exception:
            gateway = None

    speedtest_result = None
    if isinstance(st, dict) and "raw" in st:
        speedtest_result = {
            "isp": st.get("isp"),
            "client_ip": st.get("client_ip"),
            "server": st.get("server"),
            "ping_ms": st.get("ping_ms"),
            "download_bps": st.get("download_bps"),
            "upload_bps": st.get("upload_bps"),
            "timestamp": st.get("timestamp"),
        }

    notes = []
    if not HAS_NETIFACES:
        notes.append("netifaces not installed — gateway detection skipped. Install netifaces for gateway checks.")
    if gateway is None:
        notes.append("Default gateway not detected or not available.")

    return {
        "isp": speedtest_result.get("isp") if speedtest_result else None,
        "speedtest": speedtest_result,
        "pings": pings,
        "notes": " ".join(notes) if notes else None
    }
