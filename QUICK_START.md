# MindLink AI - Quick Start Guide

## 🚀 Complete Setup in 5 Steps

### Step 1: Install MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Or use MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string

### Step 2: Set Up Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/mindlink
# OR for Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mindlink

JWT_SECRET=your-super-secret-key-min-32-chars
FRONTEND_URL=http://localhost:8080
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### Step 4: Update Frontend Environment

Create `src/.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start Frontend

```bash
# From project root
npm run dev
```

Visit: http://localhost:8080

---

## ✅ Verify Everything Works

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Test Registration:**
   - Open app
   - Click "Get Started"
   - Register with email/password
   - Should see success message

3. **Test API Connection:**
   - Open browser console
   - Check Network tab
   - API calls should go to `localhost:5000/api`

---

## 🐛 Troubleshooting

**MongoDB not connecting:**
- Check if MongoDB is running: `mongosh`
- Verify MONGODB_URI in `.env`

**CORS errors:**
- Check FRONTEND_URL in backend `.env`
- Should match frontend URL (http://localhost:8080)

**Port already in use:**
- Change PORT in backend `.env`
- Or kill process: `lsof -ti:5000 | xargs kill`

---

## 📚 Next Steps

- See `BACKEND_SETUP.md` for detailed documentation
- See `ROLES_IMPLEMENTATION.md` for role system
- See `IMPLEMENTATION_STATUS.md` for feature status

