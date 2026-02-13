# 🌱 Green Core AUREA
## Enterprise Energy Intelligence Platform

[![Node](https://img.shields.io/badge/node-18+-green)]()
[![React](https://img.shields.io/badge/react-18-blue)]()
[![MongoDB](https://img.shields.io/badge/database-mongodb-brightgreen)]()
[![Security](https://img.shields.io/badge/security-production--grade-orange)]()
[![Tests](https://img.shields.io/badge/tests-jest-red)]()
[![Architecture](https://img.shields.io/badge/architecture-clean--modular-success)]()

---

# 🚀 Overview

**Green Core AUREA** is a full-stack energy management platform that helps users:

- monitor energy consumption
- track CO₂ emissions
- analyze savings
- visualize sustainability metrics
- receive personalized efficiency advice

The system is built using **enterprise architecture principles**, focusing on:

✔ security  
✔ scalability  
✔ maintainability  
✔ performance  
✔ production readiness  

It simulates a **real SaaS product**, not a simple demo app.

---

# 🧠 Technical Goals

This project demonstrates:

- clean backend architecture
- secure authentication flows
- production-ready API design
- scalable frontend state management
- modern DevOps practices
- testability

Designed specifically to showcase **professional full-stack engineering skills**.

---

# 🏗 System Architecture

Client (React + Vite)
↓ Axios (interceptors)
REST API (Express)
↓ Controllers
↓ Services
↓ Mongoose Models
↓ MongoDB


---

# ⚙️ Tech Stack

## Frontend
- React 18
- Vite
- Context API
- Axios
- Protected Routes
- OAuth redirects
- Lazy loading
- Code splitting
- Interactive charts
- Glassmorphism UI

## Backend
- Node.js 18+
- Express
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- httpOnly cookies
- OAuth (Google + GitHub)
- Nodemailer
- Winston logging
- Helmet security
- Rate limiting
- Jest + Supertest

## DevOps
- Render (Backend)
- Vercel (Frontend)
- MongoDB Atlas
- SMTP email provider

---

# 📂 Project Structure

greencore-aurea/
│
├── backend/
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── services/
│ ├── utils/
│ ├── tests/
│ └── server.js
│
├── frontend/
│ ├── src/
│ │ ├── contexts/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ └── utils/
│
└── README.md


---

# 🔐 Security Architecture

## Authentication Flow

Login
→ Access Token (15m)
→ Refresh Token (7d httpOnly cookie)
→ Silent refresh


## Protections Implemented

| Feature | Purpose |
|------------------------------|----------------------------|
JWT httpOnly cookies | prevent XSS token theft |
Refresh rotation | prevent replay attacks |
bcrypt hashing | password safety |
Rate limiting | brute-force protection |
Helmet | secure headers |
CORS whitelist | domain restriction |
Account lockout | abuse prevention |
Input sanitization | injection defense |

Security score: **8/10 (production grade)**

---

# 📡 API Design

### Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token


### Energy
GET /api/energy
POST /api/energy
GET /api/energy/analytics


### Admin
GET /api/admin/*


### Health
GET /api/health
GET /api/health/advanced


---

# 📊 Features

## Dashboard
- Energy consumption charts
- CO₂ emission tracking
- Savings comparison
- Energy source breakdown
- Smart recommendations

## Authentication
- Register/Login
- JWT sessions
- Google OAuth
- GitHub OAuth
- Password reset
- Account lockout
- Email notifications

## Backend
- Modular routing
- Middleware pipeline
- Structured logging
- Rate limiting
- Health checks
- Graceful shutdown

---

# 📈 Performance Strategy

## Frontend
✔ Lazy loading  
✔ Code splitting  
✔ Optimized bundle  
✔ Memoization  

## Backend
✔ Compression  
✔ ETag disabled (Axios fix)  
✔ Indexed queries  
✔ Stateless scaling ready  

---

# 🧪 Testing

## Stack
- Jest
- Supertest

## Commands

```bash
npm test
npm run test:watch
npm run test:health
Coverage targets:

60%+ global

🚀 Local Setup
Backend
cd backend
npm install
npm run dev
Frontend
cd frontend
npm install
npm run dev
🌍 Deployment
Recommended stack
Service	Platform
Backend	Render
Frontend	Vercel
Database	MongoDB Atlas
Email	SMTP
🔧 Engineering Decisions
Why JWT + cookies?
More secure than localStorage alone.

Why Context API?
Simpler than Redux for this scale.

Why Express?
Full control + lightweight.

Why modular routes?
Scalability + maintainability.

📦 Deployment Readiness
✔ Auth flow complete
✔ Security headers
✔ Rate limiting
✔ Health checks
✔ Logging
✔ Test suite
✔ Environment configs

Ready for production MVP.

🧠 Skills Demonstrated
Backend
✔ REST architecture
✔ JWT auth
✔ Security best practices
✔ Middleware design
✔ Testing

Frontend
✔ State management
✔ API integration
✔ Protected routes
✔ Performance optimization

DevOps
✔ Environment handling
✔ Deployment ready
✔ Monitoring ready

👨‍💻 Author
Francesco Tortora
Full-Stack Developer
Energy & Sustainability Software Systems

⭐ Final Notes
Green Core AUREA is engineered as a:

production-ready

secure

scalable

maintainable