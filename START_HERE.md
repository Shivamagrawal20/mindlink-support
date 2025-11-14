# 🚀 Start Here - Complete Setup Guide

## ✅ Current Status

- ✅ MongoDB Atlas URI configured
- ✅ Backend dependencies installed
- ⚠️ **JWT_SECRET needs updating** (security)
- ⚠️ **Backend server needs to start**

---

## 🔧 Step 1: Update JWT_SECRET (REQUIRED)

**Your JWT_SECRET is still using the placeholder!**

1. **Edit `.env` file in backend folder:**
   ```bash
   cd backend
   nano .env
   ```

2. **Find this line:**
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

3. **Replace with this secure secret:**
   ```env
   JWT_SECRET=ffda1a5d8dbbf29d498350852e13fc55f14848c54641ce681e757f5c150937cf
   ```

4. **Save and exit** (Ctrl+X, then Y, then Enter in nano)

---

## 🚀 Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

**You should see:**
```
✅ MongoDB Connected: [your-atlas-cluster]
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api
```

**If you see errors:**
- **MongoDB connection error**: Check your Atlas connection string
- **Port in use**: Kill process: `lsof -ti:5000 | xargs kill`

---

## 🌐 Step 3: Start Frontend

**Open a NEW terminal window** (keep backend running):

```bash
# From project root
npm run dev
```

Frontend will start on http://localhost:8080

---

## ✅ Step 4: Test Everything

1. **Test Backend API:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"success":true,"message":"MindLink AI Backend is running",...}`

2. **Test Frontend:**
   - Open http://localhost:8080
   - Click "Get Started"
   - Try registering a new user
   - Check browser console (F12) → Network tab
   - Should see API calls to `localhost:5000/api`

---

## 🎯 Quick Commands Reference

```bash
# Start backend (from backend folder)
cd backend && npm run dev

# Start frontend (from project root, in new terminal)
npm run dev

# Test backend health
curl http://localhost:5000/api/health

# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"password123"}'
```

---

## 🐛 Common Issues

### MongoDB Atlas Connection Error
- Check connection string in `.env`
- Verify IP whitelist in Atlas (add `0.0.0.0/0` for development)
- Check username/password are correct

### JWT_SECRET Error
- Make sure you updated it in `.env`
- Restart server after updating

### CORS Errors
- Check `FRONTEND_URL=http://localhost:8080` in backend `.env`
- Restart backend after changing

### Frontend Can't Connect
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check `src/.env.local` exists with `VITE_API_URL=http://localhost:5000/api`
- Restart frontend after creating `.env.local`

---

## ✅ Success Checklist

- [ ] JWT_SECRET updated in backend `.env`
- [ ] Backend server starts successfully
- [ ] MongoDB connection successful
- [ ] Health check returns success
- [ ] Frontend `.env.local` created
- [ ] Frontend starts on port 8080
- [ ] Can register/login from frontend
- [ ] API calls visible in browser Network tab

---

## 🎉 You're All Set!

Once both servers are running:
- **Backend**: http://localhost:5000/api
- **Frontend**: http://localhost:8080

Start building! 🚀

