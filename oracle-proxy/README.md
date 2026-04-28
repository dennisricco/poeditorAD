# Oracle Database Proxy Microservice

A lightweight Node.js microservice that enables Oracle Database connections in serverless environments (like Vercel) by acting as a proxy.

## 🎯 Purpose

Vercel and other serverless platforms cannot run Oracle's native `oracledb` driver because it requires Oracle Instant Client binaries. This proxy service solves that problem by:

1. Running on a server that supports native binaries (Railway, Render, DigitalOcean, etc.)
2. Accepting connection requests from your Vercel app
3. Connecting to Oracle databases on behalf of your app
4. Returning query results back to your app

## 🚀 Quick Start

### Option 1: Deploy to Railway (Recommended - 5 minutes)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy This Service**
   ```bash
   # From the oracle-proxy directory
   railway login
   railway init
   railway up
   ```

3. **Get Your Proxy URL**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Copy this URL

4. **Add to Vercel Environment Variables**
   ```
   ORACLE_PROXY_URL=https://your-app.railway.app
   ```

### Option 2: Deploy to Render (5 minutes)

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `oracle-proxy` directory
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Configure**
   - Environment: `Node`
   - Region: Choose closest to your Oracle DB
   - Instance Type: Free (for testing) or Starter ($7/month)

4. **Get Your Proxy URL**
   - Render will provide a URL like: `https://your-app.onrender.com`
   - Copy this URL

5. **Add to Vercel Environment Variables**
   ```
   ORACLE_PROXY_URL=https://your-app.onrender.com
   ```

### Option 3: Deploy with Docker

```bash
# Build image
docker build -t oracle-proxy .

# Run container
docker run -p 3001:3001 oracle-proxy

# Your proxy is now running at http://localhost:3001
```

## 📋 Prerequisites

### For Railway/Render Deployment
- GitHub account
- Railway or Render account (free tier available)

### For Local Development
- Node.js 18+ installed
- Oracle Instant Client installed ([Download here](https://www.oracle.com/database/technologies/instant-client/downloads.html))

## 🔧 Local Development Setup

### 1. Install Oracle Instant Client

**macOS:**
```bash
# Download from Oracle website, then:
cd ~/Downloads
unzip instantclient-basic-macos.x64-21.13.0.0.0dbru.zip
sudo mkdir -p /opt/oracle
sudo mv instantclient_21_13 /opt/oracle/
echo 'export DYLD_LIBRARY_PATH=/opt/oracle/instantclient_21_13:$DYLD_LIBRARY_PATH' >> ~/.zshrc
source ~/.zshrc
```

**Linux:**
```bash
# Download from Oracle website, then:
cd ~/Downloads
unzip instantclient-basic-linux.x64-21.13.0.0.0dbru.zip
sudo mkdir -p /opt/oracle
sudo mv instantclient_21_13 /opt/oracle/
echo '/opt/oracle/instantclient_21_13' | sudo tee /etc/ld.so.conf.d/oracle-instantclient.conf
sudo ldconfig
```

**Windows:**
```powershell
# Download from Oracle website, then:
# Extract to C:\oracle\instantclient_21_13
# Add to PATH: C:\oracle\instantclient_21_13
```

### 2. Install Dependencies

```bash
cd oracle-proxy
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed
```

### 4. Start Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```http
GET /
```

**Response:**
```json
{
  "status": "ok",
  "service": "Oracle Database Proxy",
  "version": "1.0.0",
  "timestamp": "2026-04-28T10:00:00.000Z"
}
```

### Test Connection
```http
POST /test-connection
Content-Type: application/json

{
  "host": "oracle.example.com",
  "port": "1521",
  "serviceName": "ORCL",
  "username": "your_username",
  "password": "your_password"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Oracle Database connection successful!",
  "connectionInfo": {
    "host": "oracle.example.com",
    "port": "1521",
    "serviceName": "ORCL",
    "username": "your_username",
    "type": "oracle",
    "version": "Oracle Database 19c Enterprise Edition",
    "database": "ORCL",
    "schema": "YOUR_USERNAME"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid username or password."
}
```

### Execute Query
```http
POST /execute-query
Content-Type: application/json

{
  "connectionConfig": {
    "host": "oracle.example.com",
    "port": "1521",
    "serviceName": "ORCL",
    "username": "your_username",
    "password": "your_password"
  },
  "query": "SELECT * FROM employees WHERE department_id = 10"
}
```

**Success Response (SELECT):**
```json
{
  "success": true,
  "result": {
    "columns": ["EMPLOYEE_ID", "FIRST_NAME", "LAST_NAME", "EMAIL"],
    "rows": [
      [100, "John", "Doe", "john.doe@example.com"],
      [101, "Jane", "Smith", "jane.smith@example.com"]
    ],
    "rowCount": 2,
    "executionTime": 45
  }
}
```

**Success Response (INSERT/UPDATE/DELETE):**
```json
{
  "success": true,
  "message": "INSERT query executed successfully",
  "rowsAffected": 1,
  "executionTime": 23
}
```

## 🔒 Security Considerations

### Production Deployment

1. **Use HTTPS** - Railway and Render provide HTTPS by default
2. **Add API Key Authentication** (optional):
   ```javascript
   // Add to server.js
   app.use((req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (apiKey !== process.env.API_KEY) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

3. **Rate Limiting** (optional):
   ```bash
   npm install express-rate-limit
   ```

4. **Whitelist IPs** - Configure firewall to only allow requests from Vercel IPs

### Environment Variables

Never commit `.env` file! Always use platform-specific environment variable management:

**Railway:**
- Go to your service → Variables tab
- Add: `NODE_ENV=production`

**Render:**
- Go to your service → Environment tab
- Add: `NODE_ENV=production`

## 🐛 Troubleshooting

### "Cannot load Oracle Client library"

**Solution:** Oracle Instant Client not installed or not in PATH.

**Fix:**
- Verify installation: `ls /opt/oracle/instantclient_21_13`
- Check PATH: `echo $LD_LIBRARY_PATH` (Linux) or `echo $DYLD_LIBRARY_PATH` (macOS)

### "ORA-12170: TNS:Connect timeout occurred"

**Solution:** Cannot reach Oracle server.

**Fix:**
- Verify host and port are correct
- Check firewall allows connections
- Ensure Oracle listener is running

### "ORA-01017: invalid username/password"

**Solution:** Wrong credentials.

**Fix:**
- Verify username and password
- Check if account is locked: `SELECT account_status FROM dba_users WHERE username = 'YOUR_USER';`

### "ORA-12154: TNS:could not resolve the connect identifier"

**Solution:** Invalid service name.

**Fix:**
- Verify service name: `SELECT name FROM v$database;`
- Try using SID instead of service name

### Railway/Render Deployment Issues

**"Build failed":**
- Check build logs
- Ensure `package.json` is correct
- Verify Node.js version (18+)

**"Service not responding":**
- Check if Oracle Instant Client installed correctly
- View service logs for errors
- Verify PORT environment variable

## 📊 Performance

- **Connection Timeout:** 10 seconds
- **Query Timeout:** 30 seconds (configurable)
- **Max Rows:** 1000 per query (configurable)
- **Memory:** ~100MB per instance
- **Response Time:** 50-200ms (depends on Oracle server location)

## 💰 Cost Estimate

### Railway
- **Free Tier:** 500 hours/month (enough for testing)
- **Hobby Plan:** $5/month (recommended for production)
- **Pro Plan:** $20/month (high traffic)

### Render
- **Free Tier:** Available (with limitations)
- **Starter:** $7/month (recommended for production)
- **Standard:** $25/month (high traffic)

### DigitalOcean App Platform
- **Basic:** $5/month
- **Professional:** $12/month

## 🔗 Integration with Vercel App

Your Vercel app will automatically use this proxy when users select Oracle database. No code changes needed in the UI!

The Vercel app detects Oracle connections and forwards requests to:
```
ORACLE_PROXY_URL + '/test-connection'
ORACLE_PROXY_URL + '/execute-query'
```

## 📚 Additional Resources

- [Oracle Instant Client Downloads](https://www.oracle.com/database/technologies/instant-client/downloads.html)
- [node-oracledb Documentation](https://oracle.github.io/node-oracledb/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review service logs (Railway/Render dashboard)
3. Verify Oracle Instant Client installation
4. Test connection locally first
5. Check Oracle database is accessible from internet

## 📝 License

MIT

---

**Last Updated:** 2026-04-28  
**Version:** 1.0.0  
**Node.js:** 18+  
**Oracle Instant Client:** 21.13+
