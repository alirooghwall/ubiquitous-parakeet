# Dermasan MLMVER2

A comprehensive Multi-Level Marketing (MLM) management system built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Roles**: Secure login/registration with role-based access control (Admin, Manager, Distributor, Member)
- **Participant Onboarding/Approval**: New user registration with admin approval workflow
- **Attendance & Self-Check**: Daily check-in system with mood tracking
- **Products & Packages**: Product catalog management with pricing and points
- **Sales Recording**: Track sales transactions and earn points
- **Recruitment Tracking**: Monitor and manage team recruitment
- **Genealogy Tree**: Visual representation of organizational structure
- **Analytics & Leaderboards**: Performance metrics and top performers
- **Announcements**: System-wide announcements and news
- **Internal Feed**: Social feed for team communication
- **Messenger**: Direct messaging between users
- **Notifications**: Real-time notification system
- **Search**: Global search across users, products, announcements, and posts

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/alirooghwall/ubiquitous-parakeet.git
cd ubiquitous-parakeet
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your settings:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret key for session encryption

4. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

5. Run the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

6. Access the application:
Open your browser and navigate to `http://localhost:3000`

## Default Admin Setup

To create an admin user, you'll need to manually create one in the database or register and update the role:

```javascript
// Using MongoDB shell or MongoDB Compass
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin", status: "active" } }
)
```

## Project Structure

```
ubiquitous-parakeet/
├── config/           # Configuration files
├── models/           # Mongoose models
├── routes/           # Express routes
├── views/            # EJS templates
│   ├── auth/         # Authentication views
│   ├── dashboard/    # Dashboard views
│   ├── participants/ # Participant management
│   ├── products/     # Product catalog
│   ├── sales/        # Sales tracking
│   ├── genealogy/    # Genealogy tree
│   ├── analytics/    # Analytics & leaderboards
│   ├── announcements/# Announcements
│   ├── feed/         # Social feed
│   ├── messenger/    # Messaging
│   ├── notifications/# Notifications
│   ├── search/       # Search functionality
│   └── partials/     # Reusable view components
├── middleware/       # Custom middleware
├── public/           # Static files
│   ├── css/          # Stylesheets
│   ├── js/           # Client-side scripts
│   └── uploads/      # Uploaded files
├── utils/            # Utility functions
├── app.js            # Application entry point
└── package.json      # Dependencies and scripts
```

## User Roles

- **Admin**: Full system access, user approval, analytics
- **Manager**: Team management, participant approval
- **Distributor**: Sales, recruitment, team view
- **Member**: Basic access, sales recording, profile management

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ODM
- **Templating**: EJS (Embedded JavaScript)
- **Authentication**: express-session, bcryptjs
- **File Uploads**: Multer
- **Date Handling**: Moment.js
- **Real-time**: Socket.io (for chat/notifications)

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control
- Input validation and sanitization
- Secure file uploads

## Development

```bash
# Install nodemon for auto-restart
npm install -D nodemon

# Run in development mode
npm run dev
```

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.