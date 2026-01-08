# 🍔 Web-Based POS & Inventory System

[![Deploy Status](https://img.shields.io/badge/Deployed_on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](YOUR_RENDER_LINK_HERE)
[![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> A full-stack Point of Sale (POS) and inventory management system designed for high-volume retail environments. Features real-time sales analytics, secure OAuth authentication, dynamic accessibility tools, and multi-language support.

---

## 🚀 Live Demo & Access

**🔗 URL:** [Click here to launch the App](https://project3-group51-frontend.onrender.com/)

> **⚠️ Note:** This application is hosted on the Render Free Tier. The server may go to sleep after inactivity. **Please allow 30-60 seconds for the initial load.**

---

## ✨ Key Features

### 1. 📊 Interactive Business Intelligence
- **Sales Trends:** Visualizes revenue data and best-selling items using interactive charts (`TrendsScreen`).
- **X/Z Reports:** Generates detailed sales reports for end-of-day reconciliation.

### 2. ♿ Accessibility & Inclusivity
- **Dynamic Tools:** Features built-in magnification controls (`MagnifyControls`) and high-contrast modes for visually impaired users.
- **Multi-Language Support:** Integrated **Google Translate API** (`GoogleTranslateLoader`) to support diverse customer bases in real-time.

### 3. 🛡️ Secure & Scalable Architecture
- **Authentication:** Secure login system using **Passport.js** (OAuth) strategies.
- **Role-Based Access:** Distinct interfaces for Cashiers (Transaction processing) and Managers (Inventory/Staff management).

### 4. ⚡ Efficient State Management
- **Context API:** Utilizes `UserContext` and `AccessibilityContext` for global state management across the application, reducing prop drilling.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React (Vite), Context API, CSS3 |
| **Backend** | Node.js, Express.js, Passport.js |
| **Database** | PostgreSQL (Hosted on Render/Supabase) |
| **APIs** | Google Translate API, Custom REST API |
| **Deployment** | Render, Git/GitHub |

---

## 📂 Project Structure

The project is organized as a monorepo with separate frontend and backend directories.

```bash
/
├── backend/                  # Node.js & Express Server
│   ├── auth/                 # Passport OAuth Configuration
│   ├── controllers/          # Business Logic for Orders/Items
│   ├── db/                   # Database Connection & SQL Queries
│   ├── routes/               # REST API Endpoints (Auth, Menu, Reports)
│   └── index.js              # Server Entry Point
│
└── frontend/                 # React Client (Vite)
    ├── src/
    │   ├── api/              # Axios API Service Layers
    │   ├── components/       # UI Components (Login, Cashier, Manager)
    │   ├── context/          # Global State (User, Accessibility)
    │   ├── hooks/            # Custom Hooks (useTranslate, useLanguage)
    │   └── utils/            # Helper Functions
    └── vite.config.js        # Vite Configuration
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
