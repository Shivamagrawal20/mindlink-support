# ⚠️ Important: Update JWT_SECRET

Your `.env` file still has the placeholder JWT_SECRET. You need to update it for security.

## Quick Fix

1. **Generate a secure secret:**

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Update your .env file:**

   ```bash
   nano .env
   # or use any text editor
   ```

3. **Replace this line:**

   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```

   **With:**

   ```env
   JWT_SECRET=<paste-the-generated-secret-here>
   ```

4. **Restart the server** (if it's running):
   - Stop: `Ctrl+C`
   - Start: `npm run dev`

---

## Why This Matters

JWT_SECRET is used to sign authentication tokens. If it's weak or known, attackers could create fake tokens and access user accounts.

**Never commit the real JWT_SECRET to git!**
