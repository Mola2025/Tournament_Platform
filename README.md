# 🏆 Tournament Platform

A comprehensive management system for tournaments and matches, built with the **MEAN Stack** (Angular, Express, Node.js, MongoDB) and Tailwind CSS.

This application enables administrators to create tournaments, manage player registrations, and update match scores with instant live updates powered by WebSockets.

---

## 🚀 Key Features

### 🔐 Secure Authentication

- Users can register and log in using either **Email** or **Username**.
- JWT-based authentication for protected routes.

### 🏆 Tournament Management

- Full **CRUD operations** for tournaments.
- Status tracking:
  - Open
  - Ongoing
  - Finished

### ⚡ Real-time Match System

- Automatic winner calculation based on scores.
- Instant synchronization across all connected clients.

### 📡 Live Updates

- WebSocket integration for:
  - Match score updates
  - Status changes
  - Global tournament alerts

### 🎮 Retro Aesthetic

- Custom UI inspired by **pixel-art aesthetics**.
- Animated backgrounds and responsive components.

---

## 🏗️ Project Architecture

The project is organized as a **Monorepo**:

```
/backend   → Node.js & Express server
/frontend  → Angular 17+ application
```

### Backend

- Modular structure
- JWT authentication
- Mongoose schemas
- Dedicated WebSocket handler

### Frontend

- Service-based architecture
- Angular Signals for state management
- Realtime service for socket events

---

## 🛠️ Installation & Setup

Follow these steps to run the project locally:

### 1. Prerequisites

- Node.js (v20+ recommended)
- MongoDB (local instance or Atlas)
- Angular CLI

```bash
npm install -g @angular/cli
```

---

### 2. Backend Configuration

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the server:

```bash
npm run dev
```

---

### 3. Frontend Configuration

```bash
cd ../frontend
npm install
npm run start
```

The application will be available at:

```
http://localhost:4200
```

---

## 📡 API & Real-time Events

### Core Endpoints

```
POST   /api/tournaments     → Create a new tournament
PUT    /api/matches/:id     → Update match scores (triggers socket events)
POST   /api/auth/login      → Authenticate via username or email
```

---

### WebSocket Events

- `match:updated` → Broadcasts score changes to all viewers
- `tournament:created` → Notifies users of new tournaments

---

## 🔄 CI/CD Pipeline

The project includes a **GitHub Actions** workflow:

### ✅ Validation

- Every push to `main` triggers:
  - Frontend build
  - Backend build
- Detects TypeScript and dependency errors early.

### 🚀 Automatic Deployment

- On successful build:
  - Triggers **Render Deploy Hooks**
  - Updates the live environment automatically

---

## ✒️ Author

**Mola2025**  
Lead Developer & Architect
