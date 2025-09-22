# Git Commit Guide for MERN Stack Project

## 🚫 **What NOT to Commit**

### ❌ **Never Commit These Directories/Files:**

1. **`node_modules/`** - Dependencies (can be reinstalled with `npm install`)
2. **`dist/`** - Compiled TypeScript output (generated during build)
3. **`.next/`** - Next.js build output (generated during build)
4. **`out/`** - Static export output (generated during build)
5. **`build/`** - Build artifacts (generated during build)
6. **`.env`** - Environment variables (contains secrets)
7. **`*.log`** - Log files (generated during runtime)
8. **`coverage/`** - Test coverage reports (generated during testing)

## ✅ **What TO Commit**

### 📁 **Always Commit These:**

1. **Source Code** - All `.ts`, `.tsx`, `.js`, `.jsx` files
2. **Configuration Files** - `package.json`, `tsconfig.json`, `next.config.js`
3. **Documentation** - `README.md`, `docs/` folder
4. **GitLab CI** - `.gitlab-ci.yml`, `gitlab-ci/` folder
5. **Docker Files** - `Dockerfile`, `docker-compose.yml`
6. **Environment Examples** - `.env.example` files
7. **Git Configuration** - `.gitignore`, `.gitattributes`

## 🔧 **Current Status**

### ✅ **Already Configured:**
- ✅ `.gitignore` files are properly set up
- ✅ `dist/` directory removed from Git tracking
- ✅ `node_modules/` directories are ignored
- ✅ Environment files are ignored

### 📋 **Your `.gitignore` Files Include:**

```gitignore
# Dependencies
node_modules/
*/node_modules/
**/node_modules/

# Production builds
build/
dist/
.next/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# TypeScript build outputs
*.tsbuildinfo

# Logs
*.log
logs/

# Coverage
coverage/
*.lcov
```

## 🚀 **Before Committing to GitLab**

### 1. **Check What Will Be Committed**
```bash
# See what files are staged for commit
git status

# See what files will be committed
git diff --cached --name-only
```

### 2. **Verify No Unwanted Files**
```bash
# Check for any node_modules or dist files
git status | grep -E "(node_modules|dist|\.next|out|build)"

# Should return nothing if properly ignored
```

### 3. **Clean Up If Needed**
```bash
# Remove any accidentally tracked files
git rm -r --cached application/backend/dist
git rm -r --cached application/frontend/.next
git rm -r --cached application/frontend/out

# Add to .gitignore if not already there
echo "dist/" >> application/backend/.gitignore
echo ".next/" >> application/frontend/.gitignore
echo "out/" >> application/frontend/.gitignore
```

## 📦 **Recommended Commit Structure**

### **Initial Commit**
```bash
git add .
git commit -m "Initial commit: MERN stack project setup

- Backend: NestJS API with MongoDB
- Frontend: Next.js application
- Tests: Jest test suite
- CI/CD: GitLab CI pipeline
- Docker: Containerization setup"
```

### **Feature Commits**
```bash
git add application/backend/src/events/
git commit -m "feat: add event image upload with MongoDB storage

- Add Image schema for MongoDB storage
- Update S3Service to support local development
- Add image upload endpoint
- Update frontend API integration"
```

### **Bug Fix Commits**
```bash
git add application/frontend/src/lib/api.ts
git commit -m "fix: correct API base URL for backend

- Fix API_BASE_URL to use port 3000
- Update image upload endpoint"
```

## 🔍 **Pre-Commit Checklist**

### ✅ **Before Every Commit:**

1. **Check Git Status**
   ```bash
   git status
   ```

2. **Verify No Build Artifacts**
   ```bash
   # Should not see any of these:
   # - node_modules/
   # - dist/
   # - .next/
   # - out/
   # - build/
   ```

3. **Check File Sizes**
   ```bash
   # Large files should be in .gitignore
   find . -name "*.log" -size +1M
   find . -name "*.zip" -size +10M
   ```

4. **Verify Environment Files**
   ```bash
   # Should not see .env files
   git status | grep "\.env"
   ```

## 🚨 **Common Mistakes to Avoid**

### ❌ **Don't Do This:**
```bash
# DON'T commit everything blindly
git add .
git commit -m "Update"

# DON'T commit build artifacts
git add dist/
git add node_modules/

# DON'T commit environment files
git add .env
```

### ✅ **Do This Instead:**
```bash
# DO check what you're committing
git add application/backend/src/
git add application/frontend/src/
git commit -m "feat: add specific feature"

# DO use .gitignore properly
echo "dist/" >> .gitignore
echo "node_modules/" >> .gitignore
```

## 📊 **Repository Size Optimization**

### **Before Cleanup:**
```bash
# Check repository size
du -sh .git
```

### **After Cleanup:**
```bash
# Remove build artifacts
rm -rf application/backend/dist
rm -rf application/frontend/.next
rm -rf application/frontend/out

# Remove node_modules
rm -rf application/backend/node_modules
rm -rf application/frontend/node_modules
rm -rf tests/node_modules
```

## 🔄 **GitLab CI Integration**

### **Build Process:**
1. **GitLab CI** will install dependencies (`npm install`)
2. **GitLab CI** will build the project (`npm run build`)
3. **GitLab CI** will run tests (`npm test`)
4. **GitLab CI** will create Docker images

### **No Need to Commit:**
- ❌ `node_modules/` - Installed by CI
- ❌ `dist/` - Built by CI
- ❌ `.next/` - Built by CI
- ❌ `out/` - Built by CI

## 🎯 **Best Practices**

### **1. Use Descriptive Commit Messages**
```bash
# Good
git commit -m "feat: add MongoDB image storage for local development"

# Bad
git commit -m "Update"
```

### **2. Commit Related Changes Together**
```bash
# Good - related changes
git add application/backend/src/s3/
git add application/backend/src/schemas/
git commit -m "feat: implement MongoDB image storage"

# Bad - unrelated changes
git add application/backend/src/s3/
git add application/frontend/src/components/
git commit -m "Update stuff"
```

### **3. Use Conventional Commits**
```bash
# Feature
git commit -m "feat: add user authentication"

# Bug fix
git commit -m "fix: resolve image upload issue"

# Documentation
git commit -m "docs: update API documentation"

# Refactor
git commit -m "refactor: improve code structure"
```

## 🚀 **Ready to Commit!**

Your project is now properly configured for GitLab:

✅ **`.gitignore` files are set up correctly**  
✅ **`dist/` directory removed from tracking**  
✅ **`node_modules/` directories are ignored**  
✅ **Environment files are protected**  
✅ **Build artifacts are excluded**  

You can now safely commit to GitLab without worrying about including unnecessary files!
