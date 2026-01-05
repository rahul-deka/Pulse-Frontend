# Pulse Frontend

Web application for video streaming and management with real-time processing updates.

## Live Demo

- **Frontend**: [https://pulse-streaming.vercel.app](https://pulse-streaming.vercel.app)
- **Backend API**: [https://pulse-backend-ci7j.onrender.com](https://pulse-backend-ci7j.onrender.com)

## Features

- **Authentication**
  - User registration and login
  - JWT-based authentication
  - Protected routes with role-based access
  - Persistent login with localStorage

- **Video Management**
  - Video upload with real-time progress tracking
  - Video library with filtering and sorting
  - Inline title editing
  - Video deletion with confirmation
  - Video playback with HTML5 player

- **Video Player**
  - Streaming playback with range request support
  - Custom controls (play, pause, volume, fullscreen)
  - Video metadata display (duration, size, upload date)
  - Download functionality
  - Processing status indicators

- **Dashboard**
  - Real-time statistics (total videos, processing, completed)
  - Recent uploads with processing status
  - Time-based activity tracking
  - Visual progress indicators

- **Admin Features**
  - User management (list all users)
  - Role management (promote/demote users)
  - User deletion with cascade video cleanup
  - Video count per user
  - System statistics

- **Real-time Updates**
  - WebSocket connection for live updates
  - Processing status notifications
  - Instant video completion updates
  - Real-time dashboard refresh

## 🛠️ Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: CSS Modules
- **State Management**: React Context API

## Project Structure

```
frontend/
├── public/                         # Static assets
├── src/
│   ├── assets/                     # Images, fonts, etc.
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.jsx           # Login component
│   │   │   ├── Register.jsx        # Registration component
│   │   │   └── ProtectedRoute.jsx  # Route guard
│   │   ├── Layout.jsx              # Main layout wrapper
│   │   └── Layout.css
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication context
│   ├── pages/
│   │   ├── Dashboard.jsx           # Dashboard page
│   │   ├── Upload.jsx              # Video upload page
│   │   ├── VideoLibrary.jsx        # Video library page
│   │   ├── VideoPlayer.jsx         # Video player page
│   │   └── Users.jsx               # User management (Admin)
│   ├── services/
│   │   └── api.js                  # API client configuration
│   ├── App.jsx                     # Root component
│   ├── App.css
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── .env                            # Environment variables (not in git)
├── .env.example                    # Environment template
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vercel.json                     # Vercel deployment config
├── vite.config.js
└── README.md
```

## Pages & Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | Dashboard | Protected | Overview & statistics |
| `/login` | Login | Public | User login |
| `/register` | Register | Public | User registration |
| `/upload` | Upload | Protected | Video upload |
| `/videos` | VideoLibrary | Protected | Video library |
| `/videos/:id` | VideoPlayer | Protected | Video playback |
| `/users` | Users | Admin Only | User management |

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Backend API running (see [Pulse-Backend](https://github.com/rahul-deka/Pulse-Backend))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rahul-deka/Pulse-Frontend.git
cd Pulse-Frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env     # Copy the example env file
```
Edit `.env` with your backend URL

Required environment variable:
```env
VITE_API_URL=http://localhost:5000/api
```

4. **Run the development server**
```bash
npm run dev
```

The app will start at `http://localhost:5173`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` or `https://your-backend.onrender.com/api` |

## Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

## Authentication Flow

1. User registers/logs in
2. JWT token stored in `localStorage`
3. Token sent with every API request via Axios interceptor
4. Protected routes check authentication status
5. Auto-redirect to login on 401 responses
6. Token included in video streaming URLs as query parameter

## Features in Detail

### Video Upload
- Drag & drop or click to select
- File type validation (video files only)
- Real-time upload progress bar
- Instant feedback on success/failure
- Automatic redirect to library

### Video Library
- Grid layout with video cards
- Status badges (Safe, Processing, Flagged)
- Three-dot menu for actions
- Inline title editing
- Delete with confirmation dialog
- Click to play

### Video Player
- HTML5 video player with custom controls
- Streaming with range request support
- Video metadata display
- Download option
- Status indicator
- Responsive design

### Dashboard
- Statistics cards with icons
- Recent uploads list
- Time-based relative timestamps
- Processing status indicators
- Visual progress bars

### User Management (Admin)
- User list with email, role, join date
- Video count per user
- Role change dropdown (Admin/User)
- User deletion with confirmation
- Current user excluded from list

## 📦 Deployment

### Deploy to Vercel

1. **Push code to GitHub**

2. **Import project on Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure project**
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Set environment variable**
   Add in project settings → Environment Variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

5. **Deploy**
   - Vercel will automatically deploy
   - Get your deployment URL (e.g., `https://pulse-streaming.vercel.app`)

6. **Update backend CORS**
   - Add your Vercel URL to backend's `FRONTEND_URL` environment variable
   - Redeploy backend

### Manual Build

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

## 🐛 Troubleshooting

### Cannot connect to backend
- Verify `VITE_API_URL` in `.env` file
- Check if backend server is running
- Inspect browser console for CORS errors

### Login/Authentication fails
- Clear `localStorage` and try again
- Check backend JWT_SECRET is configured
- Verify API endpoints are accessible

### Video won't play
- Check browser console for errors
- Verify video file format is supported
- Check token is being sent with streaming request

### Real-time updates not working
- Check WebSocket connection in browser dev tools
- Verify backend Socket.IO is running
- Check CORS configuration

## Security Features

- JWT token-based authentication
- Protected routes with ProtectedRoute component
- Automatic token refresh on page reload
- Secure logout (clears localStorage)
- CORS-enabled API requests
- Token included in video streaming URLs


## Backend Repository

- [Pulse Backend](https://github.com/rahul-deka/Pulse-Backend) - Backend API server