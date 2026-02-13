# 🚀 DEPLOYMENT CHECKLIST - GREEN CORE AUREA v5.2

## ✅ PRE-DEPLOYMENT (Local)

### Code Quality
- [ ] All tests pass: `npm test` (backend + frontend)
- [ ] No console.logs in production code
- [ ] No TODO/FIXME in critical paths
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds: `npm run build` (frontend)

### Security
- [ ] No secrets in code (check git history)
- [ ] `.env` files in `.gitignore`
- [ ] JWT secrets are 32+ characters
- [ ] bcrypt rounds = 12 (production)
- [ ] HTTPS redirect enabled (production)
- [ ] CSP headers configured
- [ ] `npm audit` shows no critical issues

### Database
- [ ] MongoDB indexes created: `npm run create-indexes`
- [ ] Backup strategy documented
- [ ] Connection string uses correct database name
- [ ] IP whitelist includes Render IPs (0.0.0.0/0)

### Configuration
- [ ] All required env vars documented
- [ ] `.env.example` files up to date
- [ ] Config centralized (runtime.js)
- [ ] Rate limits appropriate for traffic

---

## 🌐 DEPLOYMENT (Render Backend)

### Environment Variables (Render Dashboard)
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `MONGODB_URI` (Atlas connection string)
- [ ] `JWT_SECRET` (32+ chars, unique for production)
- [ ] `JWT_REFRESH_SECRET` (32+ chars, unique)
- [ ] `FRONTEND_URL` (Vercel URL)
- [ ] `CORS_ORIGIN` (Vercel URL)
- [ ] `GOOGLE_CLIENT_ID` (from Google Console)
- [ ] `GOOGLE_CLIENT_SECRET` (from Google Console)
- [ ] `GITHUB_CLIENT_ID` (from GitHub Settings)
- [ ] `GITHUB_CLIENT_SECRET` (from GitHub Settings)
- [ ] `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (email config)
- [ ] `EMAIL_ENABLED=true`

### OAuth Configuration
- [ ] Google Console redirect URL updated:
  ```
  https://YOUR-FRONTEND.vercel.app/auth/google/callback
  ```
- [ ] GitHub OAuth App redirect URL updated:
  ```
  https://YOUR-FRONTEND.vercel.app/auth/github/callback
  ```

### Render Settings
- [ ] Root directory: `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Health check: `/api/health`
- [ ] Region: Frankfurt (EU) or closest to users
- [ ] Plan: Starter ($7/mo) or higher

---

## 🎨 DEPLOYMENT (Vercel Frontend)

### Environment Variables (Vercel Dashboard)
- [ ] `VITE_API_URL` (Render backend URL + `/api`)
  ```
  https://greencore-aurea-api.onrender.com/api
  ```
- [ ] `VITE_FRONTEND_URL` (Vercel production URL)
- [ ] `VITE_GOOGLE_CLIENT_ID` (public, safe to expose)
- [ ] `VITE_GITHUB_CLIENT_ID` (public, safe to expose)
- [ ] `VITE_APP_NAME=Green Core AUREA`
- [ ] `VITE_APP_VERSION=5.2.0`

### Vercel Settings
- [ ] Framework: Vite
- [ ] Root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`
- [ ] Region: Same as backend (Frankfurt/EU)

---

## 🧪 POST-DEPLOYMENT TESTING

### Backend Health
```bash
# Basic health check
curl https://greencore-aurea-api.onrender.com/api/health
# Expected: {"status":"OK","uptime":123,"timestamp":...}

# Advanced health check
curl https://greencore-aurea-api.onrender.com/api/health/advanced
# Expected: {"status":"OK",...,"checks":{"database":"connected",...}}
```

### Authentication Flow
- [ ] Email/password login works
- [ ] OAuth Google redirect works
- [ ] OAuth GitHub redirect works
- [ ] JWT refresh works (check Network tab)
- [ ] Logout clears cookies

### Dashboard
- [ ] Dashboard loads without errors
- [ ] Charts render with data
- [ ] Stats cards show correct numbers
- [ ] Recent entries list populates

### CRUD Operations
- [ ] Create energy entry
- [ ] Edit energy entry
- [ ] Delete energy entry
- [ ] Export CSV works
- [ ] Search/filter works

### Admin Panel (if admin)
- [ ] User list loads
- [ ] Role changes work
- [ ] System stats display

### Performance
- [ ] Page load < 3 seconds
- [ ] API responses < 500ms
- [ ] No memory leaks (monitor Render metrics)
- [ ] No 429 rate limit errors

### Security
- [ ] HTTPS enforced (http:// redirects to https://)
- [ ] Security headers present (check DevTools → Network)
- [ ] CSP not blocking resources
- [ ] OAuth callback secure

---

## 📊 MONITORING SETUP

### Health Monitoring
- [ ] Setup UptimeRobot (free):
  - Monitor: `https://greencore-aurea-api.onrender.com/api/health`
  - Interval: 5 minutes
  - Alert: Email on downtime

### Error Tracking (Optional)
- [ ] Sentry.io configured
- [ ] Error alerts to email/Slack
- [ ] Source maps uploaded

### Logs
- [ ] Render logs accessible
- [ ] Vercel logs accessible
- [ ] Winston logs to file (backend)

---

## 🔒 SECURITY POST-DEPLOY

### Immediate Actions
- [ ] Change default admin password
- [ ] Rotate JWT secrets (if reusing from dev)
- [ ] Review and limit OAuth app permissions
- [ ] Enable GitHub Dependabot

### Weekly/Monthly
- [ ] Review access logs for suspicious activity
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Check for unused environment variables
- [ ] Review rate limit effectiveness

---

## 🐛 ROLLBACK PLAN (If Things Break)

### Quick Rollback (Render)
1. Dashboard → Deployments
2. Select previous working deployment
3. Click "Redeploy"

### Quick Rollback (Vercel)
1. Dashboard → Deployments
2. Click "..." on previous deployment
3. Select "Promote to Production"

### Database Rollback
- [ ] Atlas backup restoration documented
- [ ] Restore procedure tested
- [ ] Recovery time objective (RTO): < 1 hour

---

## 📞 SUPPORT CONTACTS

### Services
- **Render Support:** https://render.com/support
- **Vercel Support:** https://vercel.com/support
- **MongoDB Atlas:** https://support.mongodb.com

### Internal
- **Tech Lead:** [Your Name]
- **DevOps:** [Team Contact]
- **On-call:** [Rotation Schedule]

---

## 🎉 GO LIVE!

When all checkboxes above are ✅:

1. **Announce:** Notify team of deployment time
2. **Deploy Backend:** Push to main → Render auto-deploys
3. **Deploy Frontend:** Push to main → Vercel auto-deploys
4. **Verify:** Run through post-deployment tests
5. **Monitor:** Watch logs for 30 minutes
6. **Document:** Update runbook with any issues
7. **Celebrate:** 🎊 You're live!

---

**Last updated:** 2025-02-12  
**Next review:** After first production deploy
