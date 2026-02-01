# Backend - Notes Application API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
MONGO_URI=mongodb://localhost:27017/notes_app
JWT_SECRET=your_secret_key
PORT=5000
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/me` - Update profile (protected)
- `PUT /api/auth/password` - Change password (protected)

### Notes (All Protected)
- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get single note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `PATCH /api/notes/:id/pin` - Toggle pin
- `GET /api/notes/search?q=query` - Search notes
