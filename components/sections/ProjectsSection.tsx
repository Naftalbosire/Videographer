import React, { useState } from 'react';
import { Project } from '../../types';
import ProjectCard from '../ProjectCard';
import VideoModal from '../VideoModal';

interface ProjectsSectionProps {
  projects: Project[];
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const handleOpenModal = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
  };

  const handleCloseModal = () => {
    setSelectedVideoUrl(null);
  };

  return (
    <section className="min-h-screen py-24 bg-[#111111]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Projects</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A curated selection of films, music videos, and commercials. Click on a project to watch.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onWatchClick={() => handleOpenModal(project.videoUrl)}
            />
          ))}
        </div>
      </div>
      {selectedVideoUrl && (
        <VideoModal videoUrl={selectedVideoUrl} onClose={handleCloseModal} />
      )}
    </section>
  );
};

export default ProjectsSection;