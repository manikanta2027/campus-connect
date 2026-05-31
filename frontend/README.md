# Campus Connect Frontend

## What is this?
This is the React.js frontend for Campus Connect, a college-exclusive social networking platform for SRKREC students. It allows students to register, login, view feeds, manage profiles, and discover hackathons.

## Features
- ✅ User Registration with email verification (OTP)
- ✅ Login with JWT authentication
- ✅ User Feed to see other students' posts
- ✅ User Profile management
- ✅ Hackathons listing and creation

## Tech Stack
- **React.js** - Frontend framework
- **React Router** - Page navigation
- **Tailwind CSS** - Styling
- **Axios** - API requests
- **Vite** - Build tool (fast development)

## How to Setup and Run

### Step 1: Navigate to frontend folder
```bash
cd frontend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the development server
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Step 4: Make sure backend is running
- Backend should be running on `http://localhost:5000`
- Run `node server.js` in the backend folder

## Project Structure
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Register.jsx      - Registration page
│   │   ├── VerifyOTP.jsx     - OTP verification page
│   │   ├── Login.jsx          - Login page
│   │   ├── Feed.jsx           - User feed page
│   │   ├── Profile.jsx        - User profile page
│   │   └── Hackathons.jsx     - Hackathons page
│   ├── App.jsx               - Main app with routing
│   ├── main.jsx              - Entry point
│   └── index.css             - Tailwind CSS
├── index.html                - HTML template
├── package.json              - Dependencies
├── vite.config.js            - Vite configuration
├── tailwind.config.js        - Tailwind configuration
└── postcss.config.js         - PostCSS configuration
```

## Page Descriptions

### Register Page
- Students enter: name, email (@srkrec.ac.in), password, register number, department, year
- After registration, redirects to OTP verification

### Verify OTP Page
- Enter the 6-digit OTP sent to email
- After verification, redirects to login page

### Login Page
- Students enter email and password
- After successful login, redirects to feed page and stores JWT token

### Feed Page
- Shows all posts from students
- Students can create new posts (not yet implemented)
- Shows like, comment, share options for each post

### Profile Page
- Shows user information
- Edit profile button to update details
- Shows name, email, department, year, skills, bio

### Hackathons Page
- Shows list of upcoming hackathons
- Students can view prize pool, dates, team size
- "Create Hackathon" button to organize new hackathons
- Register button for each hackathon

## Code Style
- All code is beginner-friendly with detailed comments
- Each function explains what it does
- Tailwind CSS classes are used for styling
- State management with React hooks (useState, useEffect)

## Building for Production
```bash
npm run build
```

This creates optimized files in the `dist/` folder ready for deployment.

## Troubleshooting

### Port 3000 already in use?
```bash
# Kill the process on port 3000 or use a different port
npm run dev -- --port 3001
```

### Can't connect to backend?
- Make sure backend is running on port 5000
- Check that `vite.config.js` has correct proxy settings

### Tailwind CSS not working?
```bash
# Reinstall dependencies
npm install
```

## Future Enhancements
- Real post creation and display
- Search functionality
- Messaging between students
- Notification system
- Profile image upload
- Comment and like system implementation

## Questions?
Check the comments in each component for detailed explanations!
