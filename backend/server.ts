// FIX: Add triple-slash reference directives to resolve module augmentation errors. This ensures
// that types for express and express-session are loaded correctly, making the global Express
// namespace available and allowing module augmentation for session data.
/// <reference types="express" />
/// <reference types="express-session" />

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config();

// --- TYPE AUGMENTATION ---
// This tells TypeScript to add the 'isAdmin' property to the SessionData interface.
// This is the correct way to fix session-related type errors.
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

// --- CLOUDINARY CONFIGURATION ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware to handle both thumbnail and video fields
const uploadMedia = multer({
    storage: new CloudinaryStorage({
        cloudinary: cloudinary,
        params: (req, file) => {
            const isVideo = file.mimetype.startsWith('video');
            return {
                folder: isVideo ? 'videos' : 'thumbnails',
                resource_type: isVideo ? 'video' : 'image',
                allowed_formats: isVideo ? ['mp4', 'mov', 'avi'] : ['jpg', 'jpeg', 'png', 'gif']
            };
        }
    })
}).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);


const app = express();
const PORT = process.env.PORT || 5001;

// Define a whitelist of allowed origins
const whitelist = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://lucykadii.vercel.app', // FIX: Added deployed frontend URL to allow production access
];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

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
app.get('/api/projects', async (req: express.Request, res: express.Response) => {
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

const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized: You must be logged in.' });
    }
};

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
    if (req.session && req.session.isAdmin) {
        res.status(200).json({ loggedIn: true });
    } else {
        res.status(200).json({ loggedIn: false });
    }
});

app.post('/api/admin/logout', (req: express.Request, res: express.Response) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
});


// Protected route to add a new project with file uploads
app.post('/api/projects', authMiddleware, uploadMedia, async (req: express.Request, res: express.Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnailUrl = files['thumbnail']?.[0]?.path;
    const videoUrl = files['video']?.[0]?.path;

    if (!thumbnailUrl || !videoUrl) {
        return res.status(400).json({ message: 'Thumbnail and video files are required.' });
    }
    
    const newProject = new Project({
        ...req.body,
        thumbnailUrl,
        videoUrl,
    });
    
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(400).json({ message: 'Error creating project', error });
  }
});

// Protected route to update a project with optional file uploads
app.put('/api/projects/:id', authMiddleware, uploadMedia, async (req: express.Request, res: express.Response) => {
  try {
    const projectToUpdate = await Project.findById(req.params.id);
    if (!projectToUpdate) {
        return res.status(404).json({ message: 'Project not found' });
    }
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const updateData = { ...req.body };
    const filesToDelete = [];

    // If a new thumbnail is uploaded, set the new URL and mark the old one for deletion
    if (files['thumbnail']?.[0]?.path) {
        filesToDelete.push(getPublicIdFromUrl(projectToUpdate.thumbnailUrl));
        updateData.thumbnailUrl = files['thumbnail'][0].path;
    }
    // If a new video is uploaded, set the new URL and mark the old one for deletion
    if (files['video']?.[0]?.path) {
        filesToDelete.push(getPublicIdFromUrl(projectToUpdate.videoUrl));
        updateData.videoUrl = files['video'][0].path;
    }

    // Delete old files from Cloudinary
    for (const publicId of filesToDelete) {
        if (publicId) {
            const resourceType = publicId.startsWith('videos/') ? 'video' : 'image';
            cloudinary.uploader.destroy(publicId, { resource_type: resourceType }).catch(err => console.error("Failed to delete old file from Cloudinary:", err));
        }
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(400).json({ message: 'Error updating project', error });
  }
});

// Helper function to extract Cloudinary public_id from a URL
const getPublicIdFromUrl = (url: string): string | null => {
    try {
        const parts = url.split('/');
        // The public_id is everything after the version number
        const publicIdWithFormat = parts.slice(parts.indexOf('upload') + 2).join('/');
        // Remove the file extension
        const publicId = publicIdWithFormat.substring(0, publicIdWithFormat.lastIndexOf('.'));
        return publicId;
    } catch (error) {
        console.error("Could not extract public_id from URL:", url, error);
        return null;
    }
};

// Protected route to delete a project AND its files from Cloudinary
app.delete('/api/projects/:id', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    // First, find the project to get the file URLs
    const projectToDelete = await Project.findById(req.params.id);
    if (!projectToDelete) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Extract public IDs from the URLs
    const thumbPublicId = getPublicIdFromUrl(projectToDelete.thumbnailUrl);
    const videoPublicId = getPublicIdFromUrl(projectToDelete.videoUrl);

    // Asynchronously delete files from Cloudinary
    const deletePromises = [];
    if (thumbPublicId) {
        deletePromises.push(cloudinary.uploader.destroy(thumbPublicId));
    }
    if (videoPublicId) {
        deletePromises.push(cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' }));
    }

    // Wait for Cloudinary deletions to attempt completion (we don't block if they fail)
    Promise.all(deletePromises).catch(err => {
        console.error("Error deleting files from Cloudinary:", err);
    });

    // Finally, delete the project from the database
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Project and associated files deleted successfully' });
  } catch (error) {
    console.error("Error deleting project:", error)
    res.status(500).json({ message: 'Error deleting project', error });
  }
});

// FIX: Add a catch-all route for 404 errors to ensure JSON is always returned
app.use((req, res, next) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});