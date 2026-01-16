# MLMVER2 Installation and Deployment Guide

## Overview
This guide provides step-by-step instructions for installing, configuring, and deploying the Dermasan MLMVER2 application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Seeding Data](#seeding-data)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js**: Version 14.x or higher
- **MongoDB**: Version 4.4 or higher
- **npm**: Comes with Node.js
- **Git**: For version control

### Recommended Tools
- **MongoDB Compass**: GUI for MongoDB (optional)
- **Postman**: For API testing (optional)
- **VS Code**: Code editor with Node.js extensions

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/alirooghwall/ubiquitous-parakeet.git
cd ubiquitous-parakeet
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages:
- express (web framework)
- ejs (templating engine)
- mongoose (MongoDB ODM)
- bcryptjs (password hashing)
- express-session (session management)
- connect-mongo (MongoDB session store)
- multer (file uploads)
- moment (date formatting)
- socket.io (real-time features)
- And more...

## Database Setup

### Option 1: Local MongoDB

#### Install MongoDB
**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
```

**Windows:**
Download and install from https://www.mongodb.com/try/download/community

#### Start MongoDB
```bash
# Ubuntu/Debian
sudo systemctl start mongod
sudo systemctl enable mongod

# macOS
brew services start mongodb-community@6.0

# Verify MongoDB is running
mongo --eval 'db.runCommand({ connectionStatus: 1 })'
```

### Option 2: MongoDB Atlas (Cloud)

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Add your IP address to the whitelist
4. Create a database user
5. Get your connection string

## Configuration

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Edit .env File
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/mlmver2

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/mlmver2?retryWrites=true&w=majority

# Session Secret (change this to a random string in production)
SESSION_SECRET=your-very-long-random-secret-key-change-this-in-production
```

### 3. Security Best Practices
- Never commit `.env` file to Git
- Use strong, unique SESSION_SECRET in production
- Use environment variables for all sensitive data
- Regularly rotate secrets and credentials

## Running the Application

### Development Mode
```bash
# Install nodemon for auto-restart (optional)
npm install -D nodemon

# Start the application
npm run dev
```

### Production Mode
```bash
npm start
```

### Verify Application is Running
Open your browser and navigate to:
```
http://localhost:3000
```

You should see the login page.

## Seeding Data

### Initial Database Setup
The seed script creates sample data including users, products, and announcements.

```bash
npm run seed
```

### Default Users Created
After seeding, you can log in with:

**Admin Account:**
- Email: admin@mlmver2.com
- Password: admin123
- Role: Administrator (full access)

**Manager Account:**
- Email: manager1@mlmver2.com
- Password: manager123
- Role: Manager (team management)

**Distributor Account:**
- Email: distributor1@mlmver2.com
- Password: dist123
- Role: Distributor (sales and recruitment)

**Member Account:**
- Email: member1@mlmver2.com
- Password: member123
- Role: Member (basic access)

### Sample Data Created
- 4 user accounts with different roles
- 5 sample products
- 1 welcome announcement

## Production Deployment

### Preparation Checklist
- [ ] Set NODE_ENV=production in .env
- [ ] Use strong SESSION_SECRET
- [ ] Configure production MongoDB instance
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Deployment Options

#### Option 1: Traditional VPS (DigitalOcean, AWS EC2, etc.)

1. **Server Setup:**
```bash
# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB (if not using Atlas)
# See Database Setup section above
```

2. **Application Setup:**
```bash
# Clone repository
git clone https://github.com/alirooghwall/ubiquitous-parakeet.git
cd ubiquitous-parakeet

# Install dependencies
npm install --production

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Seed database (optional)
npm run seed

# Install PM2 for process management
sudo npm install -g pm2

# Start application with PM2
pm2 start app.js --name mlmver2
pm2 startup
pm2 save
```

3. **Configure Nginx Reverse Proxy:**
```bash
sudo apt-get install nginx

# Create nginx configuration
sudo nano /etc/nginx/sites-available/mlmver2
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mlmver2 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **Set up SSL with Let's Encrypt:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Option 2: Heroku

1. **Install Heroku CLI:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Deploy:**
```bash
# Login to Heroku
heroku login

# Create app
heroku create mlmver2-app

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-secret-key

# Deploy
git push heroku main

# Open application
heroku open
```

#### Option 3: Docker

1. **Create Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

2. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/mlmver2
      - SESSION_SECRET=your-secret-key
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6.0
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

3. **Run:**
```bash
docker-compose up -d
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --eval 'db.runCommand({ ping: 1 })'
```

### Application Won't Start
```bash
# Check Node.js version
node --version

# Check if port 3000 is already in use
sudo lsof -i :3000

# Check application logs
npm start 2>&1 | tee app.log
```

### Permission Issues with Uploads
```bash
# Ensure uploads directory has correct permissions
sudo chown -R $USER:$USER public/uploads
chmod 755 public/uploads
```

### Database Seeding Fails
```bash
# Clear database and try again
mongo mlmver2 --eval 'db.dropDatabase()'
npm run seed
```

### PM2 Issues
```bash
# View logs
pm2 logs mlmver2

# Restart application
pm2 restart mlmver2

# Monitor
pm2 monit
```

## Monitoring and Maintenance

### Application Monitoring
```bash
# View PM2 status
pm2 status

# View application logs
pm2 logs mlmver2 --lines 100

# Monitor resources
pm2 monit
```

### Database Backup
```bash
# Create backup
mongodump --db mlmver2 --out /path/to/backup

# Restore backup
mongorestore --db mlmver2 /path/to/backup/mlmver2
```

### Regular Maintenance
- Monitor disk space
- Check application logs regularly
- Update dependencies: `npm audit fix`
- Backup database weekly
- Monitor server resources (CPU, RAM, disk)

## Support and Documentation

- **GitHub Repository**: https://github.com/alirooghwall/ubiquitous-parakeet
- **Report Issues**: Create an issue on GitHub
- **Documentation**: See README.md for feature documentation

## License
ISC
