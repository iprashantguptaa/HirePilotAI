# Authentication Debugging Guide

## Overview

HirePilot AI uses **httpOnly cookie-based authentication** with JWT access tokens and opaque refresh tokens.

### Architecture
- **Frontend**: Vercel (e.g., `https://hirepilot-frontend.vercel.app`)
- **Backend**: Render (e.g., `https://hirepilot-backend.onrender.com`)
- **Auth Method**: httpOnly cookies with cross-origin support

## How It Works

### 1. Login/Register Flow
```
1. User submits credentials to /api/auth/login or /api/auth/register
2. Backend validates credentials
3. Backend generates:
   - accessToken (JWT, 15min expiry)
   - refreshToken (opaque token, 30day expiry)
4. Backend sets TWO httpOnly cookies:
   - accessToken (short-lived)
   - refreshToken (long-lived)
5. Backend returns user data (NOT the tokens - they're httpOnly)
6. Frontend stores user data in context/state
7. Browser automatically sends cookies with subsequent requests
```

### 2. Authenticated Request Flow
```
1. Frontend makes request to protected endpoint
2. Browser AUTOMATICALLY includes accessToken cookie
3. Backend auth middleware (authUser) validates:
   - Cookie exists
   - Token not blacklisted
   - JWT signature valid
   - JWT not expired
   - User still exists and is active
4. If valid, request proceeds
5. If invalid, returns 401 Unauthorized
```

### 3. Token Refresh Flow
```
1. Frontend makes request with expired accessToken
2. Backend returns 401
3. Frontend axios interceptor catches 401
4. Frontend calls /api/auth/refresh-token (browser sends refreshToken cookie)
5. Backend validates refreshToken
6. Backend issues NEW accessToken + refreshToken (rotation)
7. Backend revokes old refreshToken
8. Frontend retries original request with new accessToken
```

## Critical Configuration

### Backend Cookie Options (auth.controller.js)
```javascript
const baseCookieOptions = {
    httpOnly: true,                          // Prevents JS access (XSS protection)
    secure: config.isProduction,             // HTTPS only in production
    sameSite: config.isProduction ? "none" : "lax",  // "none" required for cross-origin
    path: "/",                               // Cookie sent with all requests
    // NO domain set - browser scopes to backend domain automatically
}
```

### CORS Configuration (app.js)
```javascript
app.use(cors({
    origin: function (origin, callback) {
        // Must explicitly allow frontend origin
        if (allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,  // REQUIRED for cookies
    // ...
}))
```

### Frontend API Client (apiClient.js)
```javascript
const apiClient = axios.create({
    baseURL: 'https://hirepilot-backend.onrender.com',
    withCredentials: true  // REQUIRED to send cookies cross-origin
})
```

## Environment Variables

### Backend (Render)
```bash
NODE_ENV=production                      # Enables secure cookies
FRONTEND_URL=https://hirepilot-frontend.vercel.app  # For CORS
JWT_SECRET=your-secret-here
MONGO_URI=mongodb+srv://...
GOOGLE_GENAI_API_KEY=...
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://hirepilot-backend.onrender.com
```

## Common Issues & Solutions

### Issue 1: "Access token not provided"

**Symptoms**: User logs in successfully, but subsequent requests fail with 401

**Causes**:
1. Cookies not being sent from browser to backend
2. CORS misconfiguration
3. Cookie settings incorrect for cross-origin

**Debug Steps**:
```bash
# 1. Check browser DevTools > Application > Cookies
# Should see two cookies for backend domain:
# - accessToken
# - refreshToken

# 2. Check browser DevTools > Network > Request Headers
# Should see: Cookie: accessToken=...; refreshToken=...

# 3. Check CORS preflight OPTIONS request
# Response should have:
# Access-Control-Allow-Origin: https://your-frontend.vercel.app
# Access-Control-Allow-Credentials: true

# 4. Check backend logs for CORS warnings
# Should NOT see "CORS blocked origin: ..."
```

**Solutions**:
1. Verify `FRONTEND_URL` matches actual frontend domain exactly
2. Verify `VITE_API_URL` points to correct backend
3. Verify both frontend and backend are HTTPS in production
4. Clear browser cookies and try again
5. Try in incognito mode (rules out browser extension issues)

### Issue 2: Cookies Not Being Set

**Symptoms**: After login, no cookies appear in browser DevTools

**Causes**:
1. `sameSite="none"` without `secure=true` (violates browser policy)
2. Backend not running HTTPS in production
3. Cookie domain mismatch

**Solutions**:
1. Verify `NODE_ENV=production` is set on backend
2. Verify backend URL starts with `https://`
3. Check backend logs for cookie setting confirmation
4. Verify response has `Set-Cookie` headers (Network tab)

### Issue 3: CORS Errors

**Symptoms**: Browser console shows CORS policy error

**Causes**:
1. `credentials: true` not set in CORS
2. Frontend origin not in allowed list
3. Missing `withCredentials: true` in axios

**Solutions**:
1. Verify `config.frontendUrl` in backend matches actual URL
2. Redeploy backend after changing `FRONTEND_URL`
3. Check `allowedOrigins` array in app.js includes your frontend
4. Verify axios has `withCredentials: true`

### Issue 4: Works Locally, Fails in Production

**Symptoms**: Auth works on localhost but fails when deployed

**Root Cause**: Different cookie requirements for localhost vs cross-origin

**Key Differences**:
```
Localhost (same origin):
- sameSite: "lax" works
- secure: false works (HTTP)
- No CORS issues

Production (cross-origin):
- sameSite: "none" REQUIRED
- secure: true REQUIRED (HTTPS)
- CORS credentials must be configured
```

**Solution Checklist**:
- [ ] Both frontend and backend are HTTPS
- [ ] NODE_ENV=production on backend
- [ ] FRONTEND_URL exactly matches deployed URL
- [ ] VITE_API_URL exactly matches backend URL
- [ ] Clear browser cookies before testing
- [ ] Test in incognito mode

## Testing Authentication

### Test Login
```bash
# From your terminal (replace URLs with your actual domains)
curl -X POST https://hirepilot-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt \
  -v

# Check for Set-Cookie headers in response
# Should see two Set-Cookie headers
```

### Test Authenticated Request
```bash
# Use cookies from login
curl https://hirepilot-backend.onrender.com/api/auth/me \
  -b cookies.txt \
  -v

# Should return user data, not 401
```

### Test Refresh Token
```bash
curl -X POST https://hirepilot-backend.onrender.com/api/auth/refresh-token \
  -b cookies.txt \
  -c cookies2.txt \
  -v

# Should get new cookies in cookies2.txt
```

## Production Deployment Checklist

Before deploying authentication changes:

### Backend (Render)
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL set to exact Vercel URL (no trailing slash)
- [ ] JWT_SECRET is strong and secure
- [ ] MONGO_URI is production database
- [ ] Backend URL is HTTPS
- [ ] Redeploy after env var changes

### Frontend (Vercel)
- [ ] VITE_API_URL set to exact Render URL
- [ ] Frontend URL is HTTPS
- [ ] Rebuild after env var changes (env vars are build-time)

### Testing
- [ ] Register new account
- [ ] Login with account
- [ ] Refresh page (should stay logged in)
- [ ] Navigate to protected routes
- [ ] Wait 16 minutes (token should auto-refresh)
- [ ] Logout
- [ ] Try accessing protected route (should fail)
- [ ] Test in incognito mode
- [ ] Test in different browser

## Debugging Commands

### Check Backend Health
```bash
curl https://hirepilot-backend.onrender.com/api/health
```

### Check CORS Configuration
```bash
curl -X OPTIONS https://hirepilot-backend.onrender.com/api/auth/login \
  -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### Inspect Cookies
```javascript
// In browser console on frontend domain
document.cookie  // Should be empty (httpOnly cookies not accessible)

// In browser DevTools > Application > Cookies
// Select backend domain
// Should see accessToken and refreshToken
```

### Backend Logs
```bash
# On Render dashboard, check logs for:
# - "CORS blocked origin" warnings
# - "[AUTH] No access token" messages
# - Cookie setting confirmations
```

## Security Notes

1. **Never send tokens in response body** - httpOnly cookies prevent XSS attacks
2. **Never log actual token values** - only log presence/absence for debugging
3. **Rotate refresh tokens** - prevents token reuse attacks
4. **Blacklist on logout** - ensures tokens can't be reused
5. **Verify user on every request** - ensures immediate effect of account changes
6. **Use HTTPS in production** - protects token transmission
7. **Set short access token expiry** - limits damage from token theft

## When to Clear Cookies Manually

Users should clear cookies when:
1. Seeing persistent "Access token not provided" errors
2. After you change authentication code
3. After you change backend URL
4. When testing in development

**How to clear**:
```
Chrome: DevTools > Application > Cookies > Select domain > Clear all
Firefox: DevTools > Storage > Cookies > Select domain > Delete all
Edge: DevTools > Application > Cookies > Select domain > Clear all
```

## Contact

If authentication issues persist after following this guide:
1. Check backend logs on Render
2. Check browser console for errors
3. Verify all environment variables are correct
4. Test with curl to isolate frontend vs backend issues
5. Clear all cookies and test in incognito mode
