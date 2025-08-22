# NetDetect

NetDetect is a centralized network monitoring and management system built for **Cebu Roosevelt Memorial Colleges (CRMC)**.  
It provides **real-time LAN-connected device tracking, bandwidth usage monitoring, access control, and alerts** through a web-based interface.

---

## 🔹 Overview

- **Backend**: Express.js with TypeScript  
- **Database**: PostgreSQL  
- **Caching & Rate Limiting**: Redis  
- **Background Tasks**: Celery (Python)  
- **Frontend**: React + TypeScript 
- **Firewall Integration**: Sophos Home Edition (running on PC/VM with two Ethernet ports)  
- **Containerization**: Docker + Docker Compose  

NetDetect addresses common network challenges like **delayed monitoring, unauthorized access, inefficient bandwidth tracking, and limited visibility**, making network administration faster and more secure.

---

## 🔹 Core Features

- 📡 **Device Monitoring**: Track connected devices.  
- ⚡ **Real-Time Dashboard**: Live usage stats with Redis caching.  
- ⛔ **Access Control**: Block/whitelist devices based on MAC addresses.  
- 📊 **Bandwidth Analytics**: Monitor per-device and overall network usage.  
- 🚨 **Alerts & Logging**: Get notified of unusual behavior and keep detailed access logs.  
- 🧠 **AI Layer**: Predictive insights.  

---

## 🔹 Architecture

1. **Express + TS Backend** → Handles REST API endpoints for frontend.  
2. **PostgreSQL** → Stores historical device, usage, and access logs.  
3. **Redis** → Provides caching for real-time queries and rate limiting.  
4. **Celery Workers (Python)** → Poll Sophos Home feeds every 1–2 minutes.  
5. **Frontend (React + TS)** → Mobile-responsive dashboard for administrators.  

---

## 🔹 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/rrndxx/CAPSTONE.git
cd CAPSTONE
```

### 2. Setup Environment
Create a `.env` file for backend:
```env
DATABASE_URL=postgresql://netdetect:netdetect123@postgres:5432/netdetect_db
REDIS_URL=redis://redis:6379
```

### 3. Run Services
```bash
docker-compose up --build
```
---

## 📜 License

MIT License © 2025 NetDetect Team
