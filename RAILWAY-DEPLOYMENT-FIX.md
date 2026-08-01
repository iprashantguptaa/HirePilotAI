# 🚂 RAILWAY DEPLOYMENT - CONFIGURATION FIX

**Issue:** Railway build failed during image build process  
**Cause:** Missing production start script + incorrect root directory configuration  
**Status:** ✅ FIXED - Code updated and pushed to GitHub

---

## ✅ WHAT I FIXED

### **1. Updated Backend/package.json:**
- ✅ Added `"start": "node server.js"` script (required for Railway)
- ✅ Updated package name: `yt-genai` → `hirepilot-ai-backend`
- ✅ Updated description and metadata
- ✅ Committed and pushed to GitHub

---

## 🔧 RAILWAY CONFIGURATION STEPS

Follow these steps EXACTLY to fix the deployment:

### **STEP 1: Configure Root Directory**

Railway is currently trying to build from the project root, but your backend code is in the `Backend` folder.

**In Railway Dashboard:**

1. Click on your service (`pleasing-wonder`)
2. Go to **Settings** tab
3. Scroll to **Build** section
4. Find **Root Directory**
5. Set it to: `Backend`
6. Click **Save**

**OR use Railway CLI:**
```bash
railway up --service backend --path Backend
```

---

### **STEP 2: Add Environment Variables**

**CRITICAL:** Add these environment variables BEFORE redeploying:

1. In Railway Dashboard, go to **Variables** tab
2. Click **+ New Variable** and add each:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app

# MongoDB Atlas (REQUIRED)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hirepilot?retryWrites=true&w=majority

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key-also-32-chars
REFRESH_TOKEN_EXPIRE=7d

# Google Gemini AI (REQUIRED)
GOOGLE_API_KEY=your-google-gemini-api-key

# Email (Gmail or SendGrid)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@hirepilot.ai

# Admin (optional - for creating admin user)
ADMIN_EMAIL=admin@hirepilot.ai
ADMIN_PASSWORD=SecureAdminPassword123!
```

---

### **STEP 3: Generate Required Secrets**

#### **JWT_SECRET & REFRESH_TOKEN_SECRET:**

**Option 1: Using Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Option 2: Using PowerShell**
```powershell
# Run this twice (once for JWT_SECRET, once for REFRESH_TOKEN_SECRET)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

**Option 3: Online Generator**
- Visit: https://randomkeygen.com/
- Use "CodeIgniter Encryption Keys" section
- Copy two different keys

#### **Google Gemini API Key:**

1. Go to: https://makersuite.google.com/app/apikey
2. Click **Create API Key**
3. Copy the key
4. Add to Railway as `GOOGLE_API_KEY`

#### **Gmail App Password (for emails):**

1. Enable 2FA on your Gmail: https://myaccount.google.com/security
2. Go to: https://myaccount.google.com/apppasswords
3. Create an app password for "Mail"
4. Use this as `EMAIL_PASS` (NOT your Gmail password)

---

### **STEP 4: MongoDB Atlas Setup**

**If you don't have MongoDB Atlas configured:**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create a FREE cluster (M0 Sandbox)
3. Create a database user:
   - Username: `hirepilotuser`
   - Password: Generate secure password
4. Network Access:
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Add
5. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Replace `myFirstDatabase` with `hirepilot`

**Final format:**
```
mongodb+srv://hirepilotuser:YourPassword@cluster0.xxxxx.mongodb.net/hirepilot?retryWrites=true&w=majority
```

---

### **STEP 5: Redeploy**

After configuring root directory and environment variables:

**Option A: Redeploy from Railway Dashboard**
1. Go to **Deployments** tab
2. Click the failed deployment
3. Click **Redeploy** button

**Option B: Trigger automatic redeploy**
1. Railway auto-deploys on new commits
2. The fix is already pushed to GitHub
3. Railway should detect the new commit and redeploy automatically

**Option C: Force redeploy from GitHub**
1. Go to your GitHub repo
2. Make any small change (add a space in README)
3. Commit and push
4. Railway will trigger a new deployment

---

## ✅ VERIFICATION CHECKLIST

After redeployment, verify:

- [ ] Build phase completes successfully (green checkmark)
- [ ] Health check passes at `/api/health`
- [ ] Service is running (not crashed)
- [ ] Logs show "Server is running on port 5000"
- [ ] No MongoDB connection errors in logs

---

## 🔍 CHECKING DEPLOYMENT STATUS

### **In Railway Dashboard:**

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Watch the build logs in real-time
4. Look for:
   ```
   ✓ Initialization (should complete in ~3 seconds)
   ✓ Build › Build image (should complete in ~30-60 seconds)
   ✓ Deploy (service starts running)
   ```

### **Expected Success Logs:**

```
Installing dependencies...
✓ Dependencies installed
Starting application...
Server is running on port 5000 [production]
MongoDB connected successfully
```

---

## 🐛 TROUBLESHOOTING

### **Build Still Fails:**

1. **Check Root Directory:**
   - Settings → Build → Root Directory = `Backend`

2. **Check package.json has start script:**
   - Should have: `"start": "node server.js"`
   - Already fixed in latest commit

3. **Check Node.js version:**
   - Settings → Build → Node Version
   - Should be: `20.x` or `22.x` (latest LTS)

### **Build Succeeds but Service Crashes:**

**Check Logs for:**

1. **MongoDB Connection Error:**
   ```
   MongoDB connection failed: Could not connect to MongoDB
   ```
   **Fix:** Verify `MONGO_URI` is correct and IP is whitelisted

2. **Missing Environment Variables:**
   ```
   Missing required environment variable: GOOGLE_API_KEY
   ```
   **Fix:** Add missing variable in Railway Variables tab

3. **Port Binding Error:**
   ```
   Error: listen EADDRINUSE
   ```
   **Fix:** Don't set `PORT` variable (Railway auto-assigns it)
   **Actually:** Set `PORT=5000` and Railway will use it internally

### **Health Check Fails:**

1. Railway expects health check at: `/api/health`
2. This endpoint exists in your code
3. If it fails, check:
   - Service is actually running (not crashed)
   - No errors in startup logs

---

## 📊 EXPECTED TIMELINE

| Phase | Duration | Status |
|-------|----------|--------|
| **Configuration** | 5-10 minutes | Manual |
| **Build** | 30-60 seconds | Automatic |
| **Deploy** | 10-20 seconds | Automatic |
| **Health Check** | 5-10 seconds | Automatic |
| **Total** | ~2-3 minutes | After config |

---

## 🎯 AFTER SUCCESSFUL DEPLOYMENT

Once deployment succeeds:

### **1. Save Your Backend URL:**

Railway will provide a URL like:
```
https://hirepilotai-production.up.railway.app
```

### **2. Test the API:**

**Health Check:**
```bash
curl https://your-railway-url.up.railway.app/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "uptime": 123.456
}
```

### **3. Update Frontend Environment:**

Add this to your Vercel environment variables:
```
VITE_API_URL=https://your-railway-url.up.railway.app
```

Then redeploy your frontend in Vercel.

---

## 🚀 QUICK FIX SUMMARY

**What to do RIGHT NOW:**

1. ✅ Code fix already pushed to GitHub (commit: `5df0088`)
2. 🔧 Go to Railway → Settings → Set Root Directory to `Backend`
3. 🔑 Add all environment variables (MongoDB, JWT secrets, API keys)
4. 🔄 Click "Redeploy" button
5. ✅ Watch logs until you see "Server is running"

**That's it! Your deployment should succeed now.**

---

## 📞 NEED HELP?

**Common Issues:**
- MongoDB connection: Check connection string format
- API key errors: Verify Google Gemini API key is valid
- Build failures: Check Railway logs for specific error
- Service crashes: Check environment variables are set correctly

**Logs Location:**
- Railway Dashboard → Deployments → Click deployment → View logs

**Support:**
- Railway Docs: https://docs.railway.app/
- MongoDB Docs: https://www.mongodb.com/docs/atlas/

---

**The fix is ready. Just configure Railway and redeploy!** 🚀
