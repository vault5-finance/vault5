# Vault5 Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered during Vault5 development, deployment, and usage. Issues are organized by category for quick reference.

## Table of Contents

- [Authentication Issues](#authentication-issues)
- [Database Issues](#database-issues)
- [API Issues](#api-issues)
- [Frontend Issues](#frontend-issues)
- [Build & Deployment Issues](#build--deployment-issues)
- [Performance Issues](#performance-issues)
- [Security Issues](#security-issues)

## Authentication Issues

### "Please enable cookies to continue" Error

**Symptoms:**
- Login fails with cookie-related error
- API requests return 400 Bad Request
- Device authentication not working

**Root Cause:**
The `deviceGate` middleware is rejecting requests without proper device identification.

**Solutions:**

1. **Check Device ID Header:**
   ```javascript
   // Ensure X-Device-Id header is sent with all API requests
   const deviceId = localStorage.getItem('vault5_device_id') ||
                   generateDeviceId();
   axios.defaults.headers.common['X-Device-Id'] = deviceId;
   ```

2. **Update Device Gate Middleware:**
   ```javascript
   // In middleware/auth.js
   const deviceGate = (req, res, next) => {
     // Allow requests with Authorization header (JWT auth)
     if (req.headers.authorization?.startsWith('Bearer ')) {
       return next();
     }
     // Otherwise require device ID
     const deviceId = req.headers['x-device-id'];
     if (!deviceId) {
       return res.status(400).json({
         message: 'Please enable cookies to continue'
       });
     }
     next();
   };
   ```

3. **Frontend Device ID Setup:**
   ```javascript
   // In src/utils/device.js
   export const getOrCreateDeviceId = () => {
     let deviceId = localStorage.getItem('vault5_device_id');
     if (!deviceId) {
       deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
       localStorage.setItem('vault5_device_id', deviceId);
     }
     return deviceId;
   };
   ```

### "Service not available in your region" Error

**Symptoms:**
- API requests blocked with geo-restriction error
- Development environment restrictions

**Root Cause:**
The `geoGate` middleware is blocking requests based on IP location.

**Solutions:**

1. **Disable Geo-Gating in Development:**
   ```javascript
   // In middleware/compliance.js
   const geoGate = (req, res, next) => {
     // Skip geo-check in development
     if (process.env.NODE_ENV !== 'production') {
       return next();
     }

     // Production geo-checking logic
     const clientIP = req.ip || req.connection.remoteAddress;
     // ... geo validation logic
   };
   ```

2. **Environment Variable Override:**
   ```bash
   # In .env file
   NODE_ENV=development
   ```

3. **IP Whitelist for Development:**
   ```javascript
   const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
   const clientIP = req.ip;

   if (process.env.NODE_ENV === 'development' ||
       allowedIPs.includes(clientIP)) {
     return next();
   }
   ```

### 2FA Issues

**Symptoms:**
- Two-factor authentication not working
- OTP verification failing
- Device trust not persisting

**Solutions:**

1. **Check OTP Verification Logic:**
   ```javascript
   // In authController.js verifyTwoFactor
   const isDev = process.env.NODE_ENV !== 'production';
   const isSixDigits = /^\d{6}$/.test(String(otp));

   if (isDev && isSixDigits) {
     // Accept any 6-digit code in development
     return next();
   }
   ```

2. **Device Trust Persistence:**
   ```javascript
   // Ensure device trust is saved to user model
   if (rememberDevice && deviceId) {
     user.trustedDevices = user.trustedDevices || [];
     user.trustedDevices.push({
       deviceId,
       userAgent: req.headers['user-agent'],
       ip: req.ip,
       trustedAt: new Date()
     });
     await user.save();
   }
   ```

## Database Issues

### MongoDB Connection Errors

**Symptoms:**
- "MongoServerError: Authentication failed"
- "MongooseError: Operation timed out"
- Database connection failures

**Solutions:**

1. **Check Connection String:**
   ```javascript
   // In server.js
   const mongoURI = process.env.MONGO_URI ||
                   'mongodb://localhost:27017/vault5';

   mongoose.connect(mongoURI, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     serverSelectionTimeoutMS: 5000, // Timeout after 5s
     socketTimeoutMS: 45000, // Close sockets after 45s
   });
   ```

2. **Environment Variables:**
   ```bash
   # .env file
   MONGO_URI=mongodb://localhost:27017/vault5
   # For MongoDB Atlas:
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vault5
   ```

3. **Connection Event Handlers:**
   ```javascript
   mongoose.connection.on('connected', () => {
     console.log('MongoDB connected successfully');
   });

   mongoose.connection.on('error', (err) => {
     console.error('MongoDB connection error:', err);
   });

   mongoose.connection.on('disconnected', () => {
     console.log('MongoDB disconnected');
   });
   ```

### Schema Validation Errors

**Symptoms:**
- "ValidationError" during save operations
- Required field missing errors
- Type validation failures

**Solutions:**

1. **Check Schema Definitions:**
   ```javascript
   // Example User schema
   const userSchema = new mongoose.Schema({
     name: {
       type: String,
       required: [true, 'Name is required'],
       trim: true,
       maxlength: [50, 'Name cannot exceed 50 characters']
     },
     email: {
       type: String,
       required: [true, 'Email is required'],
       unique: true,
       lowercase: true,
       validate: {
         validator: function(email) {
           return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
         },
         message: 'Please enter a valid email'
       }
     }
   });
   ```

2. **Handle Validation Errors:**
   ```javascript
   try {
     await user.save();
   } catch (error) {
     if (error.name === 'ValidationError') {
       const messages = Object.values(error.errors).map(err => err.message);
       return res.status(400).json({
         message: 'Validation failed',
         errors: messages
       });
     }
     // Handle other errors
   }
   ```

## API Issues

### Route Not Found Errors

**Symptoms:**
- 404 errors for valid endpoints
- Routes not registering properly

**Solutions:**

1. **Check Route Registration:**
   ```javascript
   // In server.js - ensure routes are registered
   const authRoutes = require('./routes/auth');
   const paymentMethodsRoutes = require('./routes/paymentMethods');

   app.use('/api/auth', authRoutes);
   app.use('/api/payment-methods', paymentMethodsRoutes);
   ```

2. **Middleware Order:**
   ```javascript
   // Correct middleware order
   app.use(cors(corsOptions));        // CORS first
   app.use(express.json());           // Body parsing
   app.use(authMiddleware);           // Auth middleware
   app.use('/api', apiRoutes);        // Routes
   ```

3. **Export Check:**
   ```javascript
   // In routes/paymentMethods.js
   module.exports = router;  // Ensure router is exported
   ```

### CORS Errors

**Symptoms:**
- "CORS policy" errors in browser console
- Preflight request failures

**Solutions:**

1. **CORS Configuration:**
   ```javascript
   const corsOptions = {
     origin: function (origin, callback) {
       const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
       if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
         callback(null, true);
       } else {
         callback(new Error('Not allowed by CORS'));
       }
     },
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id']
   };
   ```

2. **Environment Variables:**
   ```bash
   # .env file
   CORS_ALLOWED_ORIGINS=http://localhost:3000,https://vault5.vercel.app
   ```

### Rate Limiting Issues

**Symptoms:**
- 429 Too Many Requests errors
- Legitimate requests being blocked

**Solutions:**

1. **Configure Rate Limits:**
   ```javascript
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5, // 5 attempts per window
     message: {
       error: 'Too many authentication attempts, please try again later'
     },
     standardHeaders: true,
     legacyHeaders: false,
     skip: (req) => process.env.NODE_ENV === 'development'
   });
   ```

2. **Apply Selectively:**
   ```javascript
   // Only apply to auth routes
   app.use('/api/auth/login', authLimiter);
   app.use('/api/auth/register', authLimiter);
   ```

## Frontend Issues

### React CountUp Errors

**Symptoms:**
- "Cannot read properties of undefined (reading 'current')" error
- CountUp animations not working

**Root Cause:**
Incorrect usage of react-countup library.

**Solutions:**

1. **Correct Import:**
   ```javascript
   // ❌ Wrong
   import { useCountUp } from 'react-countup';

   // ✅ Correct
   import CountUp from 'react-countup';
   ```

2. **Proper Usage:**
   ```javascript
   // ❌ Wrong
   const { countUpRef } = useCountUp({ end: value, duration: 2 });
   <span ref={countUpRef} />

   // ✅ Correct
   <CountUp end={value} duration={2} separator="," />
   ```

### Build Errors

**Symptoms:**
- "Module not found" errors
- Build failures
- Import resolution issues

**Solutions:**

1. **Check Dependencies:**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Import Paths:**
   ```javascript
   // Use relative imports
   import api from '../../services/api';
   import Button from '../components/Button';

   // Or configure path aliases in webpack/vite config
   import api from '@/services/api';
   ```

3. **Environment Variables:**
   ```javascript
   // Ensure .env files are loaded
   // For Create React App
   REACT_APP_API_URL=http://localhost:5000

   // Access in code
   const apiUrl = process.env.REACT_APP_API_URL;
   ```

### State Management Issues

**Symptoms:**
- Components not re-rendering
- State updates not persisting
- Context values undefined

**Solutions:**

1. **React State Updates:**
   ```javascript
   // ❌ Wrong - mutating state directly
   const [user, setUser] = useState({});
   user.name = 'John'; // Won't trigger re-render

   // ✅ Correct - use setter function
   setUser(prev => ({ ...prev, name: 'John' }));
   ```

2. **Context Provider Setup:**
   ```javascript
   // Ensure provider wraps the app
   function App() {
     return (
       <AuthProvider>
         <Router>
           <AppContent />
         </Router>
       </AuthProvider>
     );
   }
   ```

## Build & Deployment Issues

### Port Conflicts

**Symptoms:**
- "EADDRINUSE: address already in use" error
- Server won't start

**Solutions:**

1. **Kill Process on Port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F

   # Linux/Mac
   lsof -ti:5000 | xargs kill -9
   ```

2. **Change Port:**
   ```javascript
   // In server.js
   const PORT = process.env.PORT || 5001; // Use different port
   ```

3. **Free Port Script:**
   ```javascript
   // Use the freePort script
   const freePort = require('./scripts/freePort');
   const port = await freePort(5000); // Finds next available port
   ```

### Environment Variable Issues

**Symptoms:**
- Features not working in production
- API calls failing
- Configuration not loading

**Solutions:**

1. **Check .env Files:**
   ```bash
   # Ensure .env exists and has correct values
   cat .env

   # Required variables
   MONGO_URI=mongodb://localhost:27017/vault5
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

2. **Environment-Specific Config:**
   ```javascript
   // Use different configs for different environments
   const config = {
     development: {
       apiUrl: 'http://localhost:5000',
       debug: true
     },
     production: {
       apiUrl: process.env.REACT_APP_API_URL,
       debug: false
     }
   };

   const env = process.env.NODE_ENV || 'development';
   export default config[env];
   ```

### Static File Serving Issues

**Symptoms:**
- Images not loading
- CSS/JS files not found
- 404 errors for static assets

**Solutions:**

1. **Express Static Configuration:**
   ```javascript
   // In server.js
   app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
     maxAge: '7d', // Cache for 7 days
     etag: true
   }));

   app.use(express.static(path.join(__dirname, 'public')));
   ```

2. **File Upload Paths:**
   ```javascript
   // Ensure upload directory exists
   const uploadDir = path.join(__dirname, 'uploads');
   if (!fs.existsSync(uploadDir)) {
     fs.mkdirSync(uploadDir, { recursive: true });
   }
   ```

## Performance Issues

### Slow API Responses

**Symptoms:**
- API calls taking too long
- Database queries slow
- Frontend freezing

**Solutions:**

1. **Database Indexing:**
   ```javascript
   // Add indexes for frequently queried fields
   userSchema.index({ email: 1 });
   userSchema.index({ 'phones.phone': 1 });
   transactionSchema.index({ user: 1, createdAt: -1 });
   ```

2. **Query Optimization:**
   ```javascript
   // Use select() to limit fields
   const user = await User.findById(id).select('name email');

   // Use lean() for read-only operations
   const users = await User.find().lean();

   // Add pagination
   const users = await User.find()
     .skip((page - 1) * limit)
     .limit(limit);
   ```

3. **Caching:**
   ```javascript
   // Implement Redis caching for frequently accessed data
   const cache = require('redis').createClient();

   app.get('/api/dashboard', async (req, res) => {
     const cacheKey = `dashboard:${req.user.id}`;
     const cached = await cache.get(cacheKey);

     if (cached) {
       return res.json(JSON.parse(cached));
     }

     const data = await generateDashboardData(req.user.id);
     await cache.setex(cacheKey, 300, JSON.stringify(data)); // Cache for 5 minutes

     res.json(data);
   });
   ```

### Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- Application crashes with out-of-memory errors
- Performance degradation

**Solutions:**

1. **Clean Up Event Listeners:**
   ```javascript
   useEffect(() => {
     const handleResize = () => setWindowSize(getWindowSize());
     window.addEventListener('resize', handleResize);

     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, []);
   ```

2. **Clear Timers:**
   ```javascript
   useEffect(() => {
     const interval = setInterval(() => {
       // Do something
     }, 1000);

     return () => clearInterval(interval);
   }, []);
   ```

3. **Memory Monitoring:**
   ```javascript
   // Add memory monitoring in development
   if (process.env.NODE_ENV === 'development') {
     setInterval(() => {
       const usage = process.memoryUsage();
       console.log('Memory usage:', {
         rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
         heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
         heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`
       });
     }, 30000);
   }
   ```

## Security Issues

### JWT Token Issues

**Symptoms:**
- Authentication failing unexpectedly
- Tokens not being accepted
- "Invalid token" errors

**Solutions:**

1. **Check JWT Configuration:**
   ```javascript
   // Ensure consistent secret
   const jwtSecret = process.env.JWT_SECRET;
   if (!jwtSecret) {
     throw new Error('JWT_SECRET environment variable is required');
   }

   const token = jwt.sign(payload, jwtSecret, {
     expiresIn: '30d',
     issuer: 'vault5-api'
   });
   ```

2. **Token Verification:**
   ```javascript
   const authMiddleware = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];

     if (!token) {
       return res.status(401).json({ message: 'No token provided' });
     }

     try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.user = decoded;
       next();
     } catch (error) {
       if (error.name === 'TokenExpiredError') {
         return res.status(401).json({ message: 'Token expired' });
       }
       return res.status(401).json({ message: 'Invalid token' });
     }
   };
   ```

### Input Validation Issues

**Symptoms:**
- Malformed data causing crashes
- SQL injection attempts
- XSS vulnerabilities

**Solutions:**

1. **Input Sanitization:**
   ```javascript
   const sanitizeInput = (input) => {
     if (typeof input !== 'string') return input;
     return input.trim().replace(/[<>]/g, '');
   };

   const userData = {
     name: sanitizeInput(req.body.name),
     email: req.body.email.toLowerCase().trim()
   };
   ```

2. **Validation Middleware:**
   ```javascript
   const validateUser = (req, res, next) => {
     const { name, email, password } = req.body;

     const errors = [];

     if (!name || name.length < 2) {
       errors.push('Name must be at least 2 characters');
     }

     if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
       errors.push('Valid email is required');
     }

     if (!password || password.length < 8) {
       errors.push('Password must be at least 8 characters');
     }

     if (errors.length > 0) {
       return res.status(400).json({ errors });
     }

     next();
   };
   ```

## Quick Reference

### Common Commands

```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check MongoDB connection
mongosh --eval "db.adminCommand('ismaster')"

# View logs
tail -f logs/app.log

# Check environment variables
printenv | grep -E "(MONGO|JWT|NODE_ENV)"
```

### Debug Flags

```bash
# Enable debug logging
DEBUG=vault5:* npm start

# Development mode
NODE_ENV=development

# Verbose MongoDB logging
DEBUG=mongoose:*
```

### Health Check Endpoints

- `GET /api/health` - Basic health check
- `GET /api/admin/system/health` - System health (admin only)
- `GET /api/auth/profile` - User authentication check

---

*Troubleshooting Guide v1.0 - Solutions to common Vault5 issues*