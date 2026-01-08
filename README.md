# 🍔 Web-Based POS & Inventory System

[![Deploy Status](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](YOUR_RENDER_LINK_HERE)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> A full-stack Point of Sale (POS) and inventory management system designed for high-volume transaction environments. Features real-time sales analytics, secure user authentication, and optimized database performance.

---

## 🚀 Live Demo & Access

**🔗 URL:** [Click here to view the Live Demo](YOUR_RENDER_LINK_HERE)

> **⚠️ Note:** Since this is hosted on a Render Free Tier, the server may go to sleep after inactivity. **Please allow 30-60 seconds for the initial load.**

### 🔑 Demo Credentials (Try it out!)
To explore the Manager Dashboard and Analytics features, please use the following test account:
- **ID:** `admin` (or `testuser`)
- **Password:** `1234` (or `password`)

---

## 📸 Screenshots
*(Add a GIF or Screenshot of your dashboard here. Seeing is believing!)*
![Dashboard Preview](LINK_TO_IMAGE_OR_GIF)

---

## ✨ Key Features

### 1. 📊 Interactive Business Intelligence
- **Real-Time Analytics:** Visualizes sales trends, revenue, and inventory turnover using interactive charts.
- **Data-Driven Decisions:** Helps managers identify peak hours and best-selling items instantly.

### 2. 🛡️ Secure & Scalable Architecture
- **Authentication:** Implemented secure login utilizing OAuth/JWT strategies.
- **Role-Based Access Control:** Distinct portals for Managers (Admin) and Cashiers (Staff).

### 3. ⚡ System Optimization
- **Connection Pooling:** Backend optimized to handle multiple concurrent database queries efficiently.
- **RESTful API:** Clean separation of concerns between client and server for maintainability.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React.js, Context API, CSS3 |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Hosted on Render/Supabase) |
| **Deployment** | Render, Git/GitHub Actions |

---

## 📂 Project Structure

```bash
/
├── client/           # React Frontend
│   ├── src/
│   └── components/   # Reusable UI Components
├── server/           # Node.js Backend
│   ├── routes/       # REST API Routes
│   ├── controllers/  # Business Logic
│   └── config/       # DB Connection (Pooling)
└── database/         # SQL Schema & Seeds
```

# Install
## Setup

This project includes a `setup.sh` script that installs **all backend and frontend dependencies** automatically, including required auth packages such as:

- express-session  
- passport  
- passport-google-oauth20  

### 1. Run setup script (recommended)

```bash
chmod +x setup.sh
./setup.sh
```

# Run

## Frontend
### In Developement
```bash
npm run dev
```

## Backend

### In Production
```bash
npm start
```

### In Developement
```bash
npm run dev
```
