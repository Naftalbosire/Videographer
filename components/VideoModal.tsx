import React, { useEffect } from 'react';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.3s ease-out' }}
    >
      <div 
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the video player
      >
        <button 
          onClick={onClose} 
          className="absolute -top-10 right-0 text-white text-4xl font-light hover:text-gray-300 transition-colors z-10"
          aria-label="Close video player"
        >
          &times;
        </button>
        <iframe
          src={`${videoUrl}?autoplay=1&title=0&byline=0&portrait=0`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Project Video"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoModal;