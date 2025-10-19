
import React from 'react';

const ShowreelSection: React.FC = () => {
  return (
    <section className="min-h-screen py-24 bg-[#111111]">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">Showreel</h2>
        <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
          A collection of selected works showcasing a range of styles and techniques in narrative, commercial, and documentary filmmaking.
        </p>
        <div className="aspect-video max-w-5xl mx-auto bg-black rounded-lg shadow-2xl shadow-black/50 overflow-hidden">
          {/* Replace with your actual Vimeo or YouTube embed URL */}
          <iframe
            src="https://player.vimeo.com/video/299512495?h=1f4f4c4a4e&color=ffffff&title=0&byline=0&portrait=0"
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Showreel"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default ShowreelSection;
