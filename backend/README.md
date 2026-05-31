# Campus Connect Backend

Backend server for Campus Connect - College exclusive platform for SRKREC students.

## 📁 Folder Structure

```
backend/
├── config/              # Database configuration
│   └── db.js
├── models/              # Database models only
│   └── User.js
├── controllers/         # Business logic (to be created)
├── routes/              # API endpoints (to be created)
├── middleware/          # Request handlers
│   ├── authMiddleware.js
│   └── passwordMiddleware.js
├── utils/               # Helper functions
│   ├── email.js
│   ├── otp.js
│   └── jwt.js
├── server.js            # Main server file
├── package.json         # Dependencies
└── .env.example         # Environment setup template
```

## 🚀 Setup

### 1. Install packages
```bash
cd backend
npm install
```

### 2. Create .env file
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```
MONGODB_URI=mongodb://localhost:27017/campus-connect
JWT_SECRET=your_secret_key
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
PORT=5000
```

### 3. Start server
```bash
npm run dev
```

Server will run on http://localhost:5000

## 📝 File Explanations

### Models (`models/User.js`)
- Defines user data structure in MongoDB
- Simple schema with name, email, password, skills, etc.

### Middleware (`middleware/`)
- `authMiddleware.js` - Checks if user is logged in
- `passwordMiddleware.js` - Hashes passwords for security

### Utils (`utils/`)
- `email.js` - Sends OTP and welcome emails
- `otp.js` - Creates and verifies OTP codes
- `jwt.js` - Creates login tokens

### Config (`config/db.js`)
- Connects to MongoDB
- Simple connection setup

## 🔧 Next Steps

1. Create Auth Controller
2. Create Auth Routes
3. Test with Postman
4. Build Frontend with React

