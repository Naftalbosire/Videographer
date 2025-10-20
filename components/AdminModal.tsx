

import React, { useState, useEffect, FormEvent } from 'react';
import { Project, NewProjectType } from '../types';
// FIX: Import LogOut icon from lucide-react.
import { X, Loader2, Trash2, Edit2, Image as ImageIcon, FileVideo, LogOut } from 'lucide-react';

// Define the props interface
interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onLogin: (password: string) => Promise<boolean>;
  onLogout: () => void;
  onProjectsUpdate: () => void;
}

// Initial state for a new project form
const initialProjectState: NewProjectType = {
  title: '',
  year: new Date().getFullYear(),
  role: '',
  synopsis: '',
  videoUrl: '', // Will be set by server
  thumbnailUrl: '', // Will be set by server
};

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onLogin,
  onLogout,
  onProjectsUpdate,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {isUnlocked ? (
          <ProjectCMS onLogout={onLogout} onProjectsUpdate={onProjectsUpdate} />
        ) : (
          <Login onLogin={onLogin} />
        )}
      </div>
    </div>
  );
};

// Login Component
const Login: React.FC<{ onLogin: (password: string) => Promise<boolean> }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(password);
    if (!success) {
      setError('Invalid password. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-8 text-white">
      <h2 className="text-3xl font-bold mb-6 text-center">Admin Access</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="bg-[#2a2a2a] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !password}
          className="bg-white text-black font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? <Loader2 className="animate-spin" /> : 'Unlock'}
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
};

// Project CMS Component
const ProjectCMS: React.FC<{ onLogout: () => void; onProjectsUpdate: () => void }> = ({
  onLogout,
  onProjectsUpdate,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [formData, setFormData] = useState<Omit<NewProjectType, 'videoUrl' | 'thumbnailUrl'>>(initialProjectState);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'year' ? parseInt(value, 10) || '' : value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;

    if (name === 'thumbnail') {
      setThumbnailFile(file);
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      if (file) {
        setThumbnailPreview(URL.createObjectURL(file));
      } else {
        setThumbnailPreview(editingProject ? editingProject.thumbnailUrl : null);
      }
    } else if (name === 'video') {
      setVideoFile(file);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
        title: project.title,
        year: project.year,
        role: project.role,
        synopsis: project.synopsis,
    });
    setThumbnailPreview(project.thumbnailUrl);
    setThumbnailFile(null);
    setVideoFile(null);
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setFormData(initialProjectState);
    setThumbnailFile(null);
    setVideoFile(null);
    if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete project');
      await fetchProjects();
      onProjectsUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProject && (!thumbnailFile || !videoFile)) {
        alert('Please provide both a thumbnail and a video for new projects.');
        return;
    }
    
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('year', formData.year.toString());
    data.append('role', formData.role);
    data.append('synopsis', formData.synopsis);
    if (thumbnailFile) data.append('thumbnail', thumbnailFile);
    if (videoFile) data.append('video', videoFile);

    const url = editingProject ? `/api/projects/${editingProject._id}` : '/api/projects';
    const method = editingProject ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, { method, body: data, credentials: 'include' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save project');
      }
      handleCancelEdit();
      await fetchProjects();
      onProjectsUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const FileInput = ({ name, label, icon, selectedFile, accept }: { name: string, label: string, icon: React.ReactNode, selectedFile: File | null, accept: string }) => (
    <div>
        <label className="text-sm text-gray-400 mb-1 block">{label}</label>
        <label htmlFor={name} className="w-full bg-[#222] border border-gray-600 rounded px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-[#333]">
            {icon}
            <span className="text-gray-300 truncate">{selectedFile ? selectedFile.name : `Choose a ${name}...`}</span>
        </label>
        <input id={name} type="file" name={name} accept={accept} onChange={handleFileChange} className="hidden" />
    </div>
  );

  return (
    <div className="flex-1 p-8 text-white overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin Panel</h2>
        <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
            <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#222] p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white" />
            <input type="number" name="year" placeholder="Year" value={formData.year} onChange={handleInputChange} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white" />
            <input type="text" name="role" placeholder="Role (e.g., Director)" value={formData.role} onChange={handleInputChange} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white" />
            <textarea name="synopsis" placeholder="Synopsis" value={formData.synopsis} onChange={handleInputChange} required rows={3} className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white" />
            
            <FileInput name="thumbnail" label="Thumbnail Image" icon={<ImageIcon size={20} className="text-gray-400" />} selectedFile={thumbnailFile} accept="image/*" />
            
            {thumbnailPreview && (
                <div className="mt-2">
                    <img src={thumbnailPreview} alt="Thumbnail preview" className="rounded-lg w-full max-w-xs mx-auto object-cover aspect-video" />
                </div>
            )}
            
            <FileInput name="video" label="Project Video" icon={<FileVideo size={20} className="text-gray-400" />} selectedFile={videoFile} accept="video/*" />
            
            <div className="flex space-x-2 pt-2">
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-300 disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed flex justify-center items-center">
                {isSubmitting ? <Loader2 className="animate-spin" /> : (editingProject ? 'Update Project' : 'Add Project')}
              </button>
              {editingProject && (
                <button type="button" onClick={handleCancelEdit} className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-[#222] p-6 rounded-lg max-h-[65vh] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Manage Projects</h3>
          {isLoading ? (
            <div className="flex justify-center items-center h-32"><Loader2 className="animate-spin" size={32} /></div>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <ul className="space-y-3">
              {projects.map((p) => (
                <li key={p._id} className="bg-[#3a3a3a] rounded p-3 flex justify-between items-center">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <img src={p.thumbnailUrl} alt={p.title} className="w-16 h-12 object-cover rounded flex-shrink-0"/>
                    <div className="truncate">
                        <p className="font-bold truncate">{p.title} ({p.year})</p>
                        <p className="text-sm text-gray-400 truncate">{p.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-300"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                  </div>
                </li>
              ))}
              {projects.length === 0 && <p className="text-gray-500 text-center py-4">No projects found.</p>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;