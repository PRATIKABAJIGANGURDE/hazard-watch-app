# 🚀 START HERE - INCOIS Hazard Reporting App

## ⚡ Quick Start (3 Steps)

### 1️⃣ **Configure Database** (One-time setup)
```bash
cd backend
cp .env.example .env
nano .env  # Edit with your Neon database URL
```

**Replace this line in .env:**
```env
DATABASE_URL=postgresql://username:password@hostname:5432/dbname?sslmode=require
```

**With your actual Neon connection string from [neon.tech](https://neon.tech)**

### 2️⃣ **Start Backend** (Terminal 1)
```bash
cd backend
npm run migrate  # First time only - creates database tables
npm run seed     # Optional - adds sample data
npm run dev      # Starts the API server
```

**✅ Success when you see:**
```
🚀 INCOIS Hazard Reporting API running on port 3001
```

### 3️⃣ **Start Frontend** (Terminal 2)
```bash
cd /workspace  # or just open a new terminal in workspace root
npm run dev
```

**✅ Success when you see:**
```
➜  Local:   http://localhost:3000/
```

## 🎯 **That's It!**

Your INCOIS Hazard Reporting system is now running:

- **🎨 Frontend App**: http://localhost:3000
- **🔧 Backend API**: http://localhost:3001/api  
- **📊 API Health**: http://localhost:3001/api/health

## 🧪 **Quick Test**

Test the backend is working:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "INCOIS Hazard Reporting API"
}
```

## 🆘 **If You Get Errors**

### **"Database connection failed"**
- Check your Neon connection string in `backend/.env`
- Enable PostGIS: `CREATE EXTENSION IF NOT EXISTS postgis;` in Neon SQL Editor

### **"Port already in use"**
```bash
lsof -ti:3000 | xargs kill -9  # Kill frontend
lsof -ti:3001 | xargs kill -9  # Kill backend
```

### **"Module not found"**
```bash
npm install  # In workspace root for frontend
cd backend && npm install  # For backend
```

## 🎉 **You're Ready!**

Your complete INCOIS Hazard Reporting system with Neon database is now running! 🌊

Check `backend/README.md` for detailed API documentation and examples.