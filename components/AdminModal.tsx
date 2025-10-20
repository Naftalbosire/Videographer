import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Project, NewProjectType } from '../types';
import { X, Loader2, Trash2, Edit, LogOut, UploadCloud } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  onLogin: (password: string) => Promise<boolean>;
  onLogout: () => void;
  onProjectsUpdate: () => void;
}

const emptyProject: NewProjectType = {
  title: '',
  year: new Date().getFullYear(),
  role: '',
  synopsis: '',
  videoUrl: '',
  thumbnailUrl: '',
};

const BACKEND_URL = "https://videographer.onrender.com"; // Backend URL

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  onLogin,
  onLogout,
  onProjectsUpdate,
}) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<NewProjectType & { _id?: string }>(emptyProject);
  const [isEditing, setIsEditing] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const resetFormState = () => {
    setCurrentProject(emptyProject);
    setIsEditing(false);
    setThumbnailFile(null);
    setVideoFile(null);
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setIsVerifying(false);
      resetFormState();
    } else if (isUnlocked) {
      fetchProjects();
    }
  }, [isOpen, isUnlocked]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects`, { credentials: 'include' });
      const data = await response.json();
      setProjects(data);
    } catch {
      setError('Failed to fetch projects.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);
    const success = await onLogin(password);
    if (!success) setError('Incorrect password.');
    setIsVerifying(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleProjectFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    Object.entries(currentProject).forEach(([key, value]) => {
      if (key !== '_id') formData.append(key, String(value));
    });

    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
    if (videoFile) formData.append('video', videoFile);

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `${BACKEND_URL}/api/projects/${currentProject._id}`
      : `${BACKEND_URL}/api/projects`;

    try {
      const response = await fetch(url, { method, credentials: 'include', body: formData });
      if (response.ok) {
        resetFormState();
        onProjectsUpdate();
        await fetchProjects();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to save project.');
      }
    } catch {
      setError('An error occurred while saving the project.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setCurrentProject(project);
    setIsEditing(true);
    setThumbnailFile(null);
    setVideoFile(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        onProjectsUpdate();
        await fetchProjects();
      } else {
        const errData = await response.json();
        setError(errData.message || 'Failed to delete project.');
      }
    } catch {
      setError('An error occurred while deleting the project.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] animate-fadeIn backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">{isUnlocked ? 'Admin Panel' : 'Admin Access'}</h2>
          <div className="flex items-center">
            {isUnlocked && (
              <button onClick={onLogout} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                <LogOut size={16} /> Logout
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors ml-4">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto">
          {!isUnlocked ? (
            <form onSubmit={handleLoginFormSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2 bg-[#222] border border-gray-600 rounded mb-4 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
              <button type="submit" disabled={isVerifying} className="w-full bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-300 transition-colors flex items-center justify-center">
                {isVerifying ? <Loader2 className="animate-spin" /> : 'Unlock'}
              </button>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">{isEditing ? 'Edit Project' : 'Add New Project'}</h3>
              <form onSubmit={handleProjectFormSubmit} className="space-y-4 mb-8">
                <input type="text" placeholder="Title" value={currentProject.title} onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white" />
                <input type="number" placeholder="Year" value={currentProject.year} onChange={(e) => setCurrentProject({ ...currentProject, year: parseInt(e.target.value) || new Date().getFullYear() })} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white" />
                <input type="text" placeholder="Role" value={currentProject.role} onChange={(e) => setCurrentProject({ ...currentProject, role: e.target.value })} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white" />
                <textarea placeholder="Synopsis" value={currentProject.synopsis} onChange={(e) => setCurrentProject({ ...currentProject, synopsis: e.target.value })} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white h-24" />

                {/* File Uploads */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail Image</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors flex items-center gap-2">
                      <UploadCloud size={18} /> Choose Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, setThumbnailFile)} />
                    </label>
                    <span className="text-gray-400 text-sm truncate">{thumbnailFile?.name || (isEditing ? 'Keep current image' : 'No file chosen')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Project Video</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-gray-600 text-white font-bold py-2 px-4 rounded hover:bg-gray-500 transition-colors flex items-center gap-2">
                      <UploadCloud size={18} /> Choose Video
                      <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileChange(e, setVideoFile)} />
                    </label>
                    <span className="text-gray-400 text-sm truncate">{videoFile?.name || (isEditing ? 'Keep current video' : 'No file chosen')}</span>
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded">{error}</p>}

                <div className="flex gap-4 pt-2">
                  <button type="submit" disabled={isLoading} className="bg-white text-black font-bold py-2 px-6 rounded hover:bg-gray-300 transition-colors flex items-center justify-center min-w-[140px]">
                    {isLoading ? <Loader2 className="animate-spin" /> : (isEditing ? 'Update Project' : 'Add Project')}
                  </button>
                  {isEditing && <button type="button" onClick={resetFormState} className="bg-gray-600 text-white font-bold py-2 px-6 rounded hover:bg-gray-500 transition-colors">Cancel</button>}
                </div>
              </form>

              <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Manage Projects</h3>
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p._id} className="flex justify-between items-center bg-[#222] p-3 rounded">
                    <div className="truncate pr-4">
                      <p className="font-bold truncate">{p.title} ({p.year})</p>
                      <p className="text-sm text-gray-400 truncate">{p.role}</p>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-300"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
