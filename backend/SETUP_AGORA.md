# 🎤 Setting Up Agora for Voice Rooms

## What is Agora?

Agora.io provides real-time voice and video communication. For MindLink AI, we use it for:

- **Support Circles** - Real-time voice rooms
- **Event Voice Rooms** - Online event discussions

## 🔧 Setup Steps

### Step 1: Create Agora Account

1. Go to https://console.agora.io/
2. Sign up for a free account
3. Create a new project
4. Get your **App ID** and **App Certificate**

### Step 2: Add to .env

Edit `backend/.env`:

```env
AGORA_APP_ID=your-actual-app-id-here
AGORA_APP_CERTIFICATE=your-actual-app-certificate-here
```

### Step 3: Restart Server

```bash
cd backend
# Kill existing server
lsof -ti:5000 | xargs kill
# Start fresh
npm run dev
```

---

## ⚠️ For Development (Optional)

**You can skip Agora setup for now!**

The backend will work without Agora. Voice rooms just won't generate tokens until you add credentials.

**The server will:**

- ✅ Start successfully
- ✅ Handle all other API calls
- ⚠️ Return 503 for Agora token requests (with helpful message)

**To test everything else:**

- User registration ✅
- Events ✅
- Support circles (without voice) ✅
- Mood tracking ✅

**Add Agora later when ready for voice features!**

---

## 📝 Quick Setup

1. **Get credentials from Agora Console**
2. **Add to `.env`:**
   ```env
   AGORA_APP_ID=abc123def456...
   AGORA_APP_CERTIFICATE=xyz789...
   ```
3. **Restart server**

That's it! Voice rooms will work after that.
