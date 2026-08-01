# 🎯 HirePilot AI - AI-Powered Interview Preparation Platform

> Master Your Interview, Land Your Dream Job

[![Made in India](https://img.shields.io/badge/Made%20in-India-orange?style=for-the-badge)](https://en.wikipedia.org/wiki/India)
[![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)](https://www.mongodb.com/mern-stack)

## 🌟 Overview

HirePilot AI is a production-ready AI-powered interview preparation platform designed specifically for the Indian job market. It helps candidates prepare for technical and behavioral interviews with personalized coaching, real-time feedback, and comprehensive skill assessment.

## ✨ Features

### 🎨 **Premium UI/UX**
- Modern, responsive design system
- Dark mode support
- Glassmorphism effects
- Smooth animations and transitions
- Mobile-first approach

### 🤖 **AI-Powered Features**
- Intelligent interview report generation
- Personalized skill gap analysis
- AI Assistant for mock interviews
- Resume analysis and tailored PDF generation
- Real-time chat with AI interviewer

### 📊 **Dashboard & Analytics**
- Comprehensive dashboard with animated metrics
- Interview history tracking
- Performance trends visualization
- Skill gap charts
- Match score tracking

### 👤 **User Management**
- Secure authentication (JWT + Refresh Tokens)
- Email verification
- Password reset functionality
- Profile management with resume upload
- Experience and education tracking

### 🛡️ **Admin Panel**
- User management
- Interview reports monitoring
- AI usage tracking
- Feature flags
- Feedback management
- Audit logging

### 🇮🇳 **Indianized**
- Indian Rupees (₹) currency format
- Lakh/Crore number formatting (1L+, 5L+)
- Indian phone numbers (+91)
- Indian company examples
- Bengaluru-based company info

## 🏗️ Tech Stack

### **Frontend**
- **React 19** - UI Library
- **Vite** - Build Tool
- **React Router v7** - Routing
- **SCSS** - Styling with Design Tokens
- **Context API** - State Management
- **Axios** - HTTP Client

### **Backend**
- **Node.js & Express** - Server
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication
- **Google Gemini AI** - AI Integration
- **Puppeteer** - PDF Generation
- **bcryptjs** - Password Hashing

## 📁 Project Structure

```
interview-ai-production-ready/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Design System Components
│   │   │   ├── layout/          # Layout Components
│   │   │   └── common/          # Common Components
│   │   ├── features/
│   │   │   ├── auth/            # Authentication
│   │   │   ├── dashboard/       # Dashboard
│   │   │   ├── interview/       # Interview Features
│   │   │   ├── profile/         # User Profile
│   │   │   ├── admin/           # Admin Panel
│   │   │   └── chat/            # AI Chat
│   │   ├── config/              # Brand & Config
│   │   ├── hooks/               # Custom Hooks
│   │   └── styles/              # Global Styles & Tokens
│   └── public/
├── Backend/
│   ├── src/
│   │   ├── models/              # Mongoose Models
│   │   ├── controllers/         # Route Controllers
│   │   ├── routes/              # API Routes
│   │   ├── middleware/          # Custom Middleware
│   │   ├── services/            # Business Logic
│   │   └── utils/               # Utility Functions
│   └── server.js
└── create-admin.js              # Admin User Creation Script
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v18+)
- MongoDB (local or Atlas)
- Google Gemini API Key

### **1. Clone Repository**
```bash
git clone https://github.com/iprashantguptaa/interview-ai-production-ready.git
cd interview-ai-production-ready
```

### **2. Backend Setup**
```bash
cd Backend
npm install

# Create .env file
cp .env.example .env
# Add your environment variables:
# - MONGO_URI
# - JWT_SECRET
# - REFRESH_TOKEN_SECRET
# - GEMINI_API_KEY
# - FRONTEND_URL
# - etc.

# Start backend server
npm run dev
```

### **3. Frontend Setup**
```bash
cd Frontend
npm install

# Create .env file
cp .env.example .env
# Add: VITE_API_URL=http://localhost:5000

# Start frontend dev server
npm run dev
```

### **4. Create Admin User**
```bash
# From root directory
node create-admin.js
```

## 🔐 Creating Admin Account

**Method 1: Using Script**
```bash
# Edit create-admin.js with your details
node create-admin.js
```

**Method 2: Using MongoDB**
```javascript
// In MongoDB Compass or mongosh
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## 📚 Environment Variables

### **Backend (.env)**
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/interview-ai

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### **Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000
```

## 🎨 Design System

HirePilot AI features a comprehensive design system with:
- **Design Tokens** - Colors, Typography, Spacing, Shadows
- **Component Library** - 20+ reusable UI components
- **Responsive Breakpoints** - Mobile-first approach
- **Dark Mode** - Full dark mode support
- **Accessibility** - WCAG 2.1 AA/AAA compliant

## 📱 Pages

- **Auth Pages** - Login, Register, Forgot Password, Email Verification
- **Dashboard** - Overview with metrics and charts
- **Interview Creation** - Job description & resume upload
- **Interview Report** - Detailed analysis with roadmap
- **Interview History** - All past interviews
- **Profile** - User profile and settings
- **Admin Panel** - Complete admin dashboard
- **AI Chat** - Real-time AI assistant

## 🔒 Security Features

- JWT-based authentication
- Refresh token rotation
- Password hashing (bcrypt)
- Email verification
- Rate limiting
- Token blacklisting
- Audit logging
- CORS protection
- Input validation

## 📊 Database Models

- **User** - User accounts and profiles
- **InterviewReport** - Generated interview reports
- **ChatConversation** - AI chat history
- **RefreshToken** - Refresh token storage
- **Feedback** - User feedback
- **AiUsageLog** - AI API usage tracking
- **Blacklist** - Invalidated tokens
- **AuditLog** - Admin action logs
- **FeatureFlag** - Feature toggles

## 🚢 Deployment

### **Backend (Railway)**
1. Create Railway account
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy

### **Frontend (Vercel)**
1. Create Vercel account
2. Import Git Repository
3. Framework: Vite
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add environment variables
7. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Prashant Gupta**
- GitHub: [@iprashantguptaa](https://github.com/iprashantguptaa)

## 🙏 Acknowledgments

- Google Gemini AI for AI capabilities
- MongoDB for database
- React & Vite teams
- Open source community

---

**Made with ❤️ in India 🇮🇳**

**HirePilot AI India Pvt Ltd**  
Gorakhpur, Uttar Pradesh, India  
📧 hello.hirepilotai@gmail.com  
📞 +91 9569293150
