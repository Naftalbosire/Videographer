import React from 'react';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onWatchClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onWatchClick }) => {
  return (
    <div 
      className="group relative overflow-hidden bg-black rounded-lg shadow-lg aspect-[4/3] cursor-pointer"
      onClick={onWatchClick}
      onKeyPress={(e) => e.key === 'Enter' && onWatchClick()}
      tabIndex={0}
      aria-label={`Watch project: ${project.title}`}
    >
      <img
        src={project.thumbnailUrl}
        alt={project.title}
        className="w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-110 group-focus:scale-110"
      />
      {/* Static bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      
      {/* Content visible by default */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className="text-2xl font-bold text-white">{project.title}</h3>
        <p className="text-sm text-gray-300">{project.year} &bull; {project.role}</p>
      </div>

      {/* Hover/Focus overlay with play icon and synopsis */}
      <div className="absolute inset-0 bg-black/70 p-6 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-500 ease-in-out">
          <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white ml-1">
              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.536 0 3.284L7.279 20.99c-1.25.72-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-200 text-sm">{project.synopsis}</p>
      </div>
    </div>
  );
};

export default ProjectCard;