# MindLink AI Backend

## ✅ Configuration Complete!

Your `.env` file is properly configured with:
- ✅ **JWT_SECRET** - Secure token for authentication
- ✅ **MongoDB URI** - Connected to MongoDB Atlas
- ✅ **Agora Credentials** - Ready for voice rooms
- ✅ **CORS** - Configured for frontend

---

## 🚀 Starting the Server

```bash
cd backend
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: [your-cluster]
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api
```

---

## 🧪 Testing

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8080" \
  -d '{"email":"test@example.com","name":"Test","password":"test123"}'
```

---

## 📝 API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/events` - Create event (leaders/admins)
- `GET /api/events` - List events
- `POST /api/support-circles` - Create circle (leaders/admins)
- `GET /api/support-circles` - List circles
- `POST /api/agora/token` - Get Agora token
- `POST /api/mood` - Record mood

---

## 🔐 Environment Variables

All configured in `.env`:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `AGORA_APP_ID` - Agora application ID
- `AGORA_APP_CERTIFICATE` - Agora certificate
- `FRONTEND_URL` - Frontend URL for CORS

---

## 🐛 Troubleshooting

**Server won't start:**
- Check MongoDB connection
- Verify all env variables are set
- Check port 5000 is free

**CORS errors:**
- Verify `FRONTEND_URL` in `.env`
- Restart server after changes

**MongoDB errors:**
- Check connection string
- Verify IP whitelist (for Atlas)

---

Everything is configured and ready! 🎉

