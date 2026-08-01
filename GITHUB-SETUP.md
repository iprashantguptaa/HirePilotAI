# 🐙 GITHUB SETUP GUIDE - HirePilot AI

Complete step-by-step instructions to push your project to GitHub.

---

## 📋 CURRENT STATUS

✅ **Project is cleaned and structured**  
✅ **All dependencies installed**  
✅ **Git repository initialized**  
✅ **Initial commit created:** `9147253`  
⏳ **Ready to push to GitHub**

---

## 🚀 OPTION 1: CREATE REPOSITORY THROUGH WEB INTERFACE (Recommended)

### **Step 1: Create GitHub Repository**

1. Go to: https://github.com/new

2. Fill in the details:
   ```
   Repository name: hirepilot-ai
   Description: HirePilot AI - AI-Powered Interview Preparation Platform | MERN Stack
   Visibility: Choose Public or Private
   
   ❌ DO NOT check "Initialize with README"
   ❌ DO NOT add .gitignore
   ❌ DO NOT choose a license (yet)
   ```

3. Click **"Create repository"**

### **Step 2: Add Remote and Push**

GitHub will show you quick setup instructions. Use these commands:

**Open PowerShell in your project folder:**
```powershell
cd D:\Users\Downloads\HirepilotAI
```

**Add the remote:**
```powershell
git remote add origin https://github.com/YOUR_USERNAME/hirepilot-ai.git
```
*(Replace `YOUR_USERNAME` with your actual GitHub username)*

**Push your code:**
```powershell
git push -u origin main
```

**If prompted for credentials:**
- Use your GitHub username
- Use a **Personal Access Token** (PAT) as password, not your GitHub password

---

## 🔑 CREATING A PERSONAL ACCESS TOKEN (PAT)

If you don't have a PAT, create one:

1. Go to: https://github.com/settings/tokens

2. Click **"Generate new token"** → **"Generate new token (classic)"**

3. Configure:
   ```
   Note: HirePilot AI - Local Development
   Expiration: 90 days (or No expiration)
   
   Select scopes:
   ✅ repo (full control of private repositories)
   ✅ workflow (update GitHub Actions)
   ```

4. Click **"Generate token"**

5. **COPY THE TOKEN** (you won't see it again!)

6. Use this token as your password when pushing

---

## 🚀 OPTION 2: USING GITHUB CLI (If Installed)

**Note:** GitHub CLI (`gh`) is not currently installed on your system.

If you want to install it:
1. Download from: https://cli.github.com/
2. Install and restart PowerShell
3. Run: `gh auth login`
4. Follow prompts to authenticate

**Then create and push:**
```powershell
cd D:\Users\Downloads\HirepilotAI

# Create repository
gh repo create hirepilot-ai --public --description "HirePilot AI - AI-Powered Interview Preparation Platform | MERN Stack" --source=. --remote=origin

# Push code
git push -u origin main
```

---

## 🚀 OPTION 3: SSH KEY AUTHENTICATION (Most Secure)

### **Setup SSH Key:**

1. Check if you have an SSH key:
   ```powershell
   ls ~/.ssh
   ```

2. If no key exists, generate one:
   ```powershell
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```
   Press Enter for all prompts (default location, no passphrase)

3. Copy your public key:
   ```powershell
   cat ~/.ssh/id_ed25519.pub
   ```

4. Add to GitHub:
   - Go to: https://github.com/settings/keys
   - Click **"New SSH key"**
   - Title: `HirePilot AI - Windows`
   - Paste the public key
   - Click **"Add SSH key"**

5. Create repository on GitHub (as in Option 1)

6. Add remote with SSH:
   ```powershell
   git remote add origin git@github.com:YOUR_USERNAME/hirepilot-ai.git
   git push -u origin main
   ```

---

## ✅ VERIFYING PUSH SUCCESS

After pushing, you should see:

```
Enumerating objects: 185, done.
Counting objects: 100% (185/185), done.
Delta compression using up to 8 threads
Compressing objects: 100% (175/175), done.
Writing objects: 100% (185/185), 250.12 KiB | 12.51 MiB/s, done.
Total 185 (delta 28), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (28/28), done.
To https://github.com/YOUR_USERNAME/hirepilot-ai.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**Visit your repository:**
```
https://github.com/YOUR_USERNAME/hirepilot-ai
```

You should see:
- ✅ All 175 files
- ✅ README.md displayed
- ✅ Commit: "feat: HirePilot AI - Complete redesign..."
- ✅ Green "Code" button

---

## 🔧 TROUBLESHOOTING

### **Problem: "Failed to push some refs"**

**Solution:** Repository might have files. Force push:
```powershell
git push -u origin main --force
```

### **Problem: "Authentication failed"**

**Solution:** Use a Personal Access Token instead of your password

### **Problem: "Repository not found"**

**Solution:** Check remote URL:
```powershell
git remote -v
```

Update if wrong:
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/hirepilot-ai.git
```

### **Problem: "Large file detected"**

**Solution:** This shouldn't happen since `node_modules` are excluded. If it does:
```powershell
# Verify .gitignore
cat .gitignore

# Check what's staged
git ls-files | Select-String "node_modules"
```

---

## 🎯 AFTER SUCCESSFUL PUSH

### **1. Add Repository Badges** (Optional)

Edit `README.md` to update badges:
```markdown
[![Made in India](https://img.shields.io/badge/Made%20in-India-orange?style=for-the-badge)](https://en.wikipedia.org/wiki/India)
[![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)](https://www.mongodb.com/mern-stack)
[![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/hirepilot-ai?style=for-the-badge)](https://github.com/YOUR_USERNAME/hirepilot-ai/stargazers)
```

### **2. Set Repository Settings**

- Go to: `https://github.com/YOUR_USERNAME/hirepilot-ai/settings`
- **About:** Add description and website URL
- **Topics:** Add tags like `react`, `nodejs`, `ai`, `interview-preparation`, `mern-stack`
- **Social Preview:** Upload a screenshot

### **3. Create .env.example Files**

Create template environment files for others:

**Backend/.env.example:**
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hirepilot

JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-key
REFRESH_TOKEN_EXPIRE=7d

GOOGLE_API_KEY=your-google-gemini-api-key

EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@hirepilot.ai
```

**Frontend/.env.example:**
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=HirePilot AI
VITE_APP_URL=http://localhost:5173
```

### **4. Protect Main Branch** (Recommended)

- Go to: Settings → Branches → Add branch protection rule
- Branch name: `main`
- Enable:
  - ✅ Require pull request reviews before merging
  - ✅ Require status checks to pass
  - ✅ Require branches to be up to date

---

## 🚀 NEXT: DEPLOYMENT

Once GitHub is set up, proceed to deployment:

1. **Backend:** Railway or Render
2. **Frontend:** Vercel or Netlify
3. **Database:** MongoDB Atlas

See `DEPLOYMENT.md` for detailed instructions.

---

## 📞 NEED HELP?

**If push fails:**
1. Check Git status: `git status`
2. Check remote: `git remote -v`
3. Try SSH instead of HTTPS
4. Create a new PAT with full permissions

**Current commit ready to push:**
- Commit: `9147253`
- Files: 175 changed
- Lines: 19,217 insertions

---

**You're one command away from having your project on GitHub! 🚀**
