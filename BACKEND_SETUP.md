# MindLink AI - Backend Setup Guide

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (Local installation or MongoDB Atlas account)
3. **npm** or **yarn**

---

## 🚀 Step-by-Step Setup

### Step 1: Install MongoDB

#### Option A: Local MongoDB Installation

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free tier: M0)
4. Create a database user
5. Whitelist your IP address (or use `0.0.0.0/0` for development)
6. Get your connection string

---

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/mindlink

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindlink?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRE=7d

# Agora Configuration (Get from Agora.io dashboard)
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Google OAuth (Optional - for future implementation)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Important:** 
- Generate a strong JWT_SECRET (at least 32 characters)
- Replace MongoDB credentials with your actual values
- Get Agora credentials from [Agora.io Dashboard](https://console.agora.io/)

---

### Step 4: Start MongoDB (if using local)

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongodb
```

**Windows:**
MongoDB should start automatically as a service

**Verify MongoDB is running:**
```bash
mongosh
# or
mongo
```

---

### Step 5: Start the Backend Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: localhost:27017
🚀 Server running in development mode on port 5000
📡 API available at http://localhost:5000/api
```

---

### Step 6: Test the API

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "MindLink AI Backend is running",
  "timestamp": "2025-01-XX..."
}
```

---

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   ├── User.js              # User model
│   ├── Event.js             # Event model
│   ├── SupportCircle.js     # Support Circle model
│   └── Report.js            # Report model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── events.js            # Event routes
│   ├── supportCircles.js    # Support Circle routes
│   ├── agora.js             # Agora token generation
│   └── mood.js              # Mood tracking routes
├── utils/
│   └── generateToken.js     # JWT token generation
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment file
├── .gitignore
├── package.json
└── server.js                # Main server file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (protected, leaders/admins)
- `PUT /api/events/:id/approve` - Approve event (protected, admins/moderators)
- `PUT /api/events/:id/reject` - Reject event (protected, admins/moderators)
- `POST /api/events/:id/rsvp` - RSVP to event (protected)

### Support Circles
- `GET /api/support-circles` - Get all circles
- `GET /api/support-circles/:id` - Get single circle
- `POST /api/support-circles` - Create circle (protected, leaders/admins)
- `POST /api/support-circles/:id/join` - Join circle (protected)
- `POST /api/support-circles/:id/leave` - Leave circle (protected)

### Agora
- `POST /api/agora/token` - Generate Agora token (protected)

### Mood Tracking
- `POST /api/mood` - Record mood (protected)
- `GET /api/mood` - Get mood history (protected)

---

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🗄️ Database Models

### User
- email, name, password (hashed)
- role (user, community_leader, moderator, admin, super_admin)
- isAnonymous, googleId
- preferences, moodHistory
- timestamps

### Event
- title, description, hostId
- date, time, location
- type (offline/online/hybrid)
- category, status, tags
- maxParticipants, currentParticipants
- rsvps, channelName
- timestamps

### SupportCircle
- topic, description, hostId
- channelName, duration
- maxParticipants, currentParticipants
- isPrivate, anonymousMode, aiModeration
- status, participants, flags
- timestamps

### Report
- type, roomId, eventId
- reportedBy, reportedUser
- content, description
- status, reviewedBy, action
- timestamps

---

## 🧪 Testing the Backend

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Event (with token)
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Event",
    "description": "This is a test event",
    "date": "2025-12-01",
    "time": "10:00 AM",
    "location": "Test Location",
    "type": "offline",
    "category": "wellness"
  }'
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running: `mongosh` or `mongo`
- Verify MONGODB_URI in .env file
- Check MongoDB logs

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 5000

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Token might be expired (default: 7 days)

### CORS Errors
- Verify FRONTEND_URL in .env matches your frontend URL
- Check CORS configuration in server.js

---

## 📝 Next Steps

1. **Connect Frontend** - Update frontend API calls to use backend
2. **Add More Endpoints** - Reports, analytics, etc.
3. **Implement Google OAuth** - Add Google authentication
4. **Add File Upload** - For event banners, user avatars
5. **Set up Production** - Deploy to cloud (Heroku, AWS, etc.)

---

## 🔒 Security Notes

- Never commit `.env` file to git
- Use strong JWT_SECRET in production
- Enable HTTPS in production
- Use MongoDB Atlas IP whitelisting
- Implement rate limiting
- Add input validation and sanitization
- Use helmet.js (already included)

---

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Agora.io Documentation](https://docs.agora.io/)

