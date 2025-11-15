# Setting Up Your .env File

## ✅ Your .env file is already created!

You just need to **edit it** with your actual values. Here's what to change:

### 1. MongoDB URI

**For Local MongoDB (if installed):**
```env
MONGODB_URI=mongodb://localhost:27017/mindlink
```

**For MongoDB Atlas (Cloud - Recommended):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Click "Connect" → "Connect your application"
5. Copy connection string
6. Replace `<password>` with your database password
7. Update in .env:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mindlink?retryWrites=true&w=majority
```

### 2. JWT Secret (REQUIRED)

Generate a secure secret (run this command):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then update in .env:
```env
JWT_SECRET=<paste-the-generated-secret-here>
```

### 3. Agora Configuration (Optional for now)

You can leave these as placeholders for now:
```env
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-app-certificate
```

Get these from https://console.agora.io/ when ready.

### 4. Llama Configuration (For AI Chat)

Configure your Llama provider. Options: `replicate` or `huggingface`

**For Replicate:**
```env
LLAMA_PROVIDER=replicate
REPLICATE_API_TOKEN=your-replicate-api-token-here
```

**For Hugging Face:**
```env
LLAMA_PROVIDER=huggingface
HUGGINGFACE_API_TOKEN=your-huggingface-api-token-here
```

### 5. Frontend URL (Already correct)

```env
FRONTEND_URL=http://localhost:8080
```

---

## 📝 Quick Edit Command

You can edit the .env file with:
```bash
nano .env
# or
code .env  # if you have VS Code
# or
open -e .env  # opens in TextEdit (macOS)
```

---

## ✅ Minimum Required Changes

At minimum, you MUST update:
1. ✅ `MONGODB_URI` - Your MongoDB connection string
2. ✅ `JWT_SECRET` - A secure random string (32+ characters)

Everything else can use default/placeholder values for now.

---

## 🧪 Test Your Setup

After editing .env, test the connection:

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost:27017
🚀 Server running in development mode on port 5000
```

If you see MongoDB connection errors, check your MONGODB_URI.

