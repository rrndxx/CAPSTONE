# NetDetect

NetDetect is a centralized network monitoring and management system built for **Cebu Roosevelt Memorial Colleges (CRMC)**.  
It provides **real-time LAN-connected device tracking, bandwidth usage monitoring, access control, and alerts** through a web-based interface.

---

## 🔹 Overview

- **Backend**: Express.js with TypeScript  
- **Database**: PostgreSQL  
- **Caching & Rate Limiting**: Redis  
- **Background Tasks**: Celery (Python)  
- **Frontend**: React + TypeScript (responsive web UI)  
- **Firewall Integration**: Sophos Home Edition (running on PC/VM with two Ethernet ports)  
- **Containerization**: Docker + Docker Compose  

NetDetect addresses common network challenges like **delayed monitoring, unauthorized access, inefficient bandwidth tracking, and limited visibility**, making network administration faster and more secure.

---

## 🔹 Core Features

- 📡 **Device Monitoring**: Track connected devices (via Sophos Home API or simulated XML feeds).  
- ⚡ **Real-Time Dashboard**: Live usage stats with Redis caching.  
- ⛔ **Access Control**: Block/whitelist devices based on MAC addresses.  
- 📊 **Bandwidth Analytics**: Monitor per-device and overall network usage.  
- 🚨 **Alerts & Logging**: Get notified of unusual behavior and keep detailed access logs.  
- 🧠 **Extensible AI Layer**: Behavior detection and predictive insights (future).  

---

## 🔹 Architecture

1. **Express + TS Backend** → Handles REST API endpoints for frontend.  
2. **PostgreSQL** → Stores historical device, usage, and access logs.  
3. **Redis** → Provides caching for real-time queries and rate limiting.  
4. **Celery Workers (Python)** → Poll Sophos Home or simulated XML feeds every 1–2 minutes.  
5. **Frontend (React + TS)** → Mobile-responsive dashboard for administrators.  

---

## 🔹 Getting Started

### 1. Clone Repository
```bash
git clone https://github.com/your-org/netdetect.git
cd netdetect
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

### 4. Run Backend
```bash
cd backend
npm install
npm run dev
```

---

## 🔹 Project Roadmap

- ✅ Setup PostgreSQL, Redis, and Celery in Docker  
- ✅ Express + TypeScript backend with Prisma ORM  
- 🔄 Integrate with Sophos Home firewall (API/VM)  
- 🔄 Implement frontend pages (dashboard, devices, alerts, reports)  
- 🔮 AI-powered insights (predictive analytics, anomaly detection)  

---

## 📜 License

MIT License © 2025 NetDetect Team
