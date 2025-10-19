import React from 'react';

const HomeSection: React.FC = () => {
  return (
    <section className="h-screen w-full flex items-center justify-center relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 z-0"
        poster="https://picsum.photos/seed/poster/1920/1080"
      >
        {/* Replace with actual video URL */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-top-aerial-shot-of-seashore-with-rocks-1090-large.mp4" type="video/mp4" />
      </video>
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>
      <div className="z-20 text-center text-white">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight">Lucy Kadii</h1>
        <p className="mt-4 text-lg md:text-xl tracking-widest uppercase text-gray-300">
          Director &bull; Cinematographer &bull; Editor &bull; Producer
        </p>
      </div>
    </section>
  );
};

export default HomeSection;