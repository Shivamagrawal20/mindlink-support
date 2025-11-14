# 🚀 Next Steps - Backend Setup Complete!

## ✅ What You've Done
- ✅ Installed backend dependencies
- ✅ Created .env file
- ✅ Added MongoDB URI
- ✅ Fixed deprecated packages

## 📋 Next Steps

### Step 1: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: [your-mongodb-host]
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api
```

**If you see MongoDB connection errors:**
- **Local MongoDB**: Make sure it's running: `brew services start mongodb-community`
- **MongoDB Atlas**: Check your connection string and IP whitelist

### Step 2: Test the Backend API

Open a new terminal and test:

```bash
# Health check
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"message":"MindLink AI Backend is running",...}
```

### Step 3: Configure Frontend

Create `src/.env.local` in the project root:

```bash
cd ..  # Go back to project root
echo "VITE_API_URL=http://localhost:5000/api" > src/.env.local
```

Or manually create `src/.env.local` with:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 4: Start Frontend

```bash
# From project root
npm run dev
```

Frontend will run on http://localhost:8080

### Step 5: Test Full Integration

1. Open http://localhost:8080
2. Click "Get Started"
3. Try registering a new user
4. Check browser console (F12) → Network tab
5. You should see API calls to `localhost:5000/api`

---

## 🧪 Test User Registration

You can test the API directly:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "role": "user",
    ...
  }
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check MongoDB URI in .env
- Verify username/password are correct
- For Atlas: Check IP whitelist (add `0.0.0.0/0` for development)

### Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill

# Or change PORT in .env
PORT=5001
```

### CORS Errors in Browser
**Error:** `Access to fetch at 'http://localhost:5000/api' from origin 'http://localhost:8080' has been blocked by CORS policy`

**Solution:**
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Should be: `FRONTEND_URL=http://localhost:8080`

### Frontend Can't Connect
**Error:** `Failed to fetch` or network errors

**Solution:**
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check `VITE_API_URL` in `src/.env.local`
- Check browser console for exact error

---

## ✅ Verification Checklist

- [ ] Backend server starts without errors
- [ ] MongoDB connection successful
- [ ] Health check returns success
- [ ] Frontend `.env.local` created
- [ ] Frontend can make API calls
- [ ] User registration works
- [ ] User login works

---

## 🎯 What's Working Now

✅ **Backend API** - All endpoints ready
✅ **Authentication** - Register, login, anonymous mode
✅ **Database** - MongoDB connected
✅ **Frontend API Service** - Ready to use
✅ **AuthDialog** - Connected to backend

---

## 📚 Next: Connect Other Components

Once basic auth works, you can connect:
- Events page → `eventsAPI.getAll()`
- Rooms page → `supportCirclesAPI.getAll()`
- Create Event → `eventsAPI.create()`
- Create Circle → `supportCirclesAPI.create()`
- Mood Tracker → `moodAPI.record()`

See `BACKEND_CONNECTION_COMPLETE.md` for details.

---

## 🎉 You're Ready!

Start the backend server and test it out! 🚀

