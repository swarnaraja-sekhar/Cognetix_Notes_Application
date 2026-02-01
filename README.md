# Cognetix Notes Application v2.0

A full-featured MERN (MongoDB, Express, React, Node.js) notes application with JWT authentication and advanced features.

## 🚀 Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **CRUD Operations**: Create, read, update, and delete notes
- **User Isolation**: Each user can only access their own notes
- **Pin Notes**: Pin important notes to the top
- **Color Coding**: Assign colors to organize your notes
- **Search**: Search through your notes by title or content
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop, tablet, and mobile

### Advanced Features (v2.0)
- **Tags & Labels**: Categorize notes with customizable tags
- **Folders**: Organize notes into hierarchical folders
- **Trash & Restore**: Soft delete with 30-day recovery
- **Archive**: Archive notes to declutter your workspace
- **Favorites**: Mark notes as favorites for quick access
- **Note Sharing**: Share notes via email or public links
- **Note Templates**: Create and use reusable note templates
- **Reminders**: Set reminders for important notes
- **User Profile**: Manage profile, preferences, and statistics
- **Data Export**: Export all your data in JSON format
- **Rate Limiting**: API protection against abuse
- **Word Count**: Automatic word and character counting

## 📁 Project Structure

```
Cognetix_Notes_Application/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── noteController.js
│   │   ├── tagController.js
│   │   ├── folderController.js
│   │   ├── templateController.js
│   │   ├── shareController.js
│   │   ├── reminderController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Note.js
│   │   ├── Tag.js
│   │   ├── Folder.js
│   │   ├── Template.js
│   │   ├── SharedNote.js
│   │   └── Reminder.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── noteRoutes.js
│   │   ├── tagRoutes.js
│   │   ├── folderRoutes.js
│   │   ├── templateRoutes.js
│   │   ├── shareRoutes.js
│   │   ├── reminderRoutes.js
│   │   └── profileRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── ConfirmModal.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── NoteCard.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Archive.jsx
    │   │   ├── CreateNote.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── EditNote.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── NoteDetails.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Register.jsx
    │   │   ├── SharedNote.jsx
    │   │   └── Trash.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    └── vite.config.js
```

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-rate-limit for API protection
- nodemailer for email features

### Frontend
- React 18 with Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Hot Toast
- React Icons

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## 🚀 Getting Started

### 1. Clone or navigate to the project

```bash
cd Cognetix_Notes_Application
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your MongoDB URI and JWT secret

# Start server
npm run dev
```

### 3. Setup Frontend

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb://localhost:27017/notes_app
JWT_SECRET=your_super_secret_key
PORT=5000
NODE_ENV=development
```

### Frontend (.env - optional)
```
VITE_API_URL=http://localhost:5000/api
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/me | Update profile |
| PUT | /api/auth/password | Change password |

### Notes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notes | Get all user notes |
| POST | /api/notes | Create new note |
| GET | /api/notes/:id | Get single note |
| PUT | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Delete note |
| PATCH | /api/notes/:id/pin | Toggle pin status |
| GET | /api/notes/search?q=query | Search notes |

## 🔐 Security

- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire after 7 days
- All note operations require authentication
- Users can only access their own notes
- CORS is configured for the frontend origin

## 📱 Screenshots

The application features:
- Clean landing page with feature highlights
- User-friendly login and registration forms
- Dashboard with grid/list view toggle
- Note cards with pin and color options
- Full-featured note editor
- Dark mode support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using the MERN Stack
