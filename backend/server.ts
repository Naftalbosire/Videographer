
// FIX: Use a default import for express and aliased named imports for types to avoid clashes with global types.
import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'YOUR_DEPLOYED_FRONTEND_URL' // TODO: Replace with your actual frontend URL
    : 'http://localhost:3000', // Or your local dev port
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Session Configuration
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  console.error("FATAL ERROR: SESSION_SECRET is not defined.");
  process.exit(1);
}

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Prevents client-side JS from reading the cookie
        secure: process.env.NODE_ENV === "production", // Ensures cookie is sent over HTTPS in production
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Extend Express Session type to include our custom property
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}


// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));
  
// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  role: { type: String, required: true },
  synopsis: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
});

const Project = mongoose.model('Project', projectSchema);

// --- API Routes ---

// Public route to get all projects
app.get('/api/projects', async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const projects = await Project.find().sort({ year: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Admin Authentication
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();
if (!ADMIN_PASSWORD) {
    console.error("FATAL ERROR: ADMIN_PASSWORD is not defined.");
    process.exit(1);
}

// SECURE: Middleware to check for an active admin session
const authMiddleware = (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
    }
};

// Route to verify password and create a session
app.post('/api/admin/login', (req: ExpressRequest, res: ExpressResponse) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true; // Set the session
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Incorrect password' });
    }
});

// Route to check login status
app.get('/api/admin/status', (req: ExpressRequest, res: ExpressResponse) => {
    if (req.session && req.session.isAdmin) {
        res.status(200).json({ loggedIn: true });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

// Route to destroy the session (logout)
app.post('/api/admin/logout', (req: ExpressRequest, res: ExpressResponse) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.status(200).json({ message: 'Logout successful' });
    });
});


// Protected route to add a new project
app.post('/api/projects', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project', error });
  }
});

// Protected route to update a project
app.put('/api/projects/:id', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project', error });
  }
});

// Protected route to delete a project
app.delete('/api/projects/:id', authMiddleware, async (req: ExpressRequest, res: ExpressResponse) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '..', 'build')));
app.get('*', (req: ExpressRequest, res: ExpressResponse) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});