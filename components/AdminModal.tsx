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

const BACKEND_URL = "https://videographer.onrender.com";

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, isUnlocked, onLogin, onLogout, onProjectsUpdate }) => {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<NewProjectType & { _id?: string }>(emptyProject);
  const [isEditing, setIsEditing] = useState(false);

  const resetFormState = () => {
    setCurrentProject(emptyProject);
    setIsEditing(false);
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
      const res = await fetch(`${BACKEND_URL}/api/projects`, { credentials: 'include' });
      const data = await res.json();
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

  const handleProjectFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing
      ? `${BACKEND_URL}/api/projects/${currentProject._id}`
      : `${BACKEND_URL}/api/projects`;

    try {
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProject),
      });
      if (!response.ok) {
        const errData = await response.json();
        setError(errData.message || 'Failed to save project.');
      } else {
        resetFormState();
        onProjectsUpdate();
        await fetchProjects();
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
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        onProjectsUpdate();
        await fetchProjects();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to delete project.');
      }
    } catch {
      setError('Error deleting project.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={onClose}>
      <div className="bg-[#1a1a1a] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">{isUnlocked ? 'Admin Panel' : 'Admin Access'}</h2>
          <div className="flex items-center">
            {isUnlocked && <button onClick={onLogout} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"><LogOut size={16}/>Logout</button>}
            <button onClick={onClose} className="text-gray-400 hover:text-white ml-4"><X size={24}/></button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto">
          {!isUnlocked ? (
            <form onSubmit={handleLoginFormSubmit}>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="w-full p-2 bg-[#222] border border-gray-600 rounded mb-4 text-white"/>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button type="submit" disabled={isVerifying} className="w-full bg-white text-black font-bold py-2 px-4 rounded">{isVerifying ? '...' : 'Unlock'}</button>
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Project' : 'Add New Project'}</h3>
              <form onSubmit={handleProjectFormSubmit} className="space-y-4 mb-8">
                <input type="text" placeholder="Title" value={currentProject.title} onChange={e => setCurrentProject({...currentProject, title: e.target.value})} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white"/>
                <input type="number" placeholder="Year" value={currentProject.year} onChange={e => setCurrentProject({...currentProject, year: parseInt(e.target.value)})} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white"/>
                <input type="text" placeholder="Role" value={currentProject.role} onChange={e => setCurrentProject({...currentProject, role: e.target.value})} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white"/>
                <textarea placeholder="Synopsis" value={currentProject.synopsis} onChange={e => setCurrentProject({...currentProject, synopsis: e.target.value})} required className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white h-24"/>
                <input type="text" placeholder="Video URL" value={currentProject.videoUrl} onChange={e => setCurrentProject({...currentProject, videoUrl: e.target.value})} className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white"/>
                <input type="text" placeholder="Thumbnail URL" value={currentProject.thumbnailUrl} onChange={e => setCurrentProject({...currentProject, thumbnailUrl: e.target.value})} className="w-full p-2 bg-[#222] border border-gray-600 rounded text-white"/>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-4 pt-2">
                  <button type="submit" disabled={isLoading} className="bg-white text-black py-2 px-6 rounded">{isEditing ? 'Update Project' : 'Add Project'}</button>
                  {isEditing && <button type="button" onClick={resetFormState} className="bg-gray-600 text-white py-2 px-6 rounded">Cancel</button>}
                </div>
              </form>

              <h3 className="text-xl font-bold mb-4">Manage Projects</h3>
              <div className="space-y-3">
                {projects.map(p => (
                  <div key={p._id} className="flex justify-between items-center bg-[#222] p-3 rounded">
                    <div>
                      <p className="font-bold">{p.title} ({p.year})</p>
                      <p className="text-sm text-gray-400">{p.role}</p>
                    </div>
                    <div className="flex gap-3">
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
