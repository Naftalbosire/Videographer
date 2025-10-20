import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

dotenv.config();
console.log("Loaded ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD ? "[DEFINED]" : "[NOT DEFINED]");

const app = express();
const PORT = process.env.PORT || 5001;

// --- CORS Configuration ---
const whitelist = [
  'http://localhost:3000',      // Create React App default
  'http://localhost:5173',      // Vite default
  'http://127.0.0.1:5173',      // Vite alternate
  'https://lucykadii.vercel.app' // Deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or curl)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// --- Middleware ---
app.use(express.json());
app.use(cookieParser());

// --- Session Configuration ---
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
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// Extend Express Session type to include our custom property
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Project Schema ---
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, required: true },
  role: { type: String, required: true },
  synopsis: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
});

const Project = mongoose.model('Project', projectSchema);

// --- Admin Password ---
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();
if (!ADMIN_PASSWORD) {
  console.error("FATAL ERROR: ADMIN_PASSWORD is not defined.");
  process.exit(1);
}

// --- Authentication Middleware ---
const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.session && req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
  }
};

// --- Admin Routes ---
app.post('/api/admin/login', (req: express.Request, res: express.Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Incorrect password' });
  }
});

app.get('/api/admin/status', (req: express.Request, res: express.Response) => {
  res.status(200).json({ loggedIn: !!(req.session && req.session.isAdmin) });
});

app.post('/api/admin/logout', (req: express.Request, res: express.Response) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    res.clearCookie('connect.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
    });
    res.status(200).json({ message: 'Logout successful' });
  });
});

// --- Public Routes ---
app.get('/api/projects', async (req: express.Request, res: express.Response) => {
  try {
    const projects = await Project.find().sort({ year: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// --- Protected Project Routes ---
app.post('/api/projects', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project', error });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
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

app.delete('/api/projects/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
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

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
