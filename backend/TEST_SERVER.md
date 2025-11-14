# 🧪 Test Your Backend Server

## Step 1: Start the Server

```bash
cd backend
npm run dev
```

**Look for these messages:**
```
✅ MongoDB Connected: [your-cluster-name]
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api
```

**If you see errors:**
- MongoDB connection error → Check your `.env` MONGODB_URI
- Port in use → Kill process: `lsof -ti:5000 | xargs kill`
- Import errors → Run: `npm install`

## Step 2: Test Health Endpoint

**In a new terminal:**
```bash
curl http://localhost:5000/api/health
```

**Expected:**
```json
{
  "success": true,
  "message": "MindLink AI Backend is running",
  "timestamp": "2025-..."
}
```

## Step 3: Test CORS (Preflight)

```bash
curl -X OPTIONS http://localhost:5000/api/auth/register \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Look for:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: http://localhost:8080
< Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS,PATCH
```

## Step 4: Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

**Expected:**
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

## Step 5: Test from Browser

1. Open http://localhost:8080
2. Open Developer Tools (F12)
3. Go to Network tab
4. Click "Get Started" → Register
5. Check the request:
   - Status: 200 or 201 ✅
   - Response: JSON with user data ✅
   - No CORS errors ✅

---

## 🐛 Troubleshooting

### Server Won't Start
- Check MongoDB connection in `.env`
- Verify all dependencies: `npm install`
- Check for syntax errors in server.js

### 403 Forbidden
- Server might not be fully started (wait 5-10 seconds)
- Check CORS configuration
- Verify Helmet settings

### CORS Still Blocked
- Make sure CORS is BEFORE Helmet in server.js
- Check browser console for exact error
- Verify server is actually running

### MongoDB Connection Error
- Check MONGODB_URI in `.env`
- For Atlas: Verify IP whitelist
- Test connection: `mongosh "your-connection-string"`

---

## ✅ Success Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns success
- [ ] CORS preflight returns 200
- [ ] Registration works from curl
- [ ] Registration works from browser
- [ ] No CORS errors in browser console

---

Once all tests pass, your backend is fully working! 🎉

