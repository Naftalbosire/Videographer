import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center py-24 bg-[#111111]">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/3 w-full">
            <div className="aspect-square bg-black rounded-lg overflow-hidden shadow-2xl shadow-black/50">
              <img 
                src="components\sections\assets\Me.jpeg" 
                // src="components\sections\assets\me.mp4"
                alt="Lucy Kadii" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="lg:w-2/3 w-full">
            <h2 className="text-4xl font-bold mb-6">About Me</h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                I am an award-winning filmmaker with a passion for visual storytelling. With a background in fine arts and a diploma in Videography from the prestigious Kenya Institute of Mass Communication, I bring a unique and painterly eye to every project.
              </p>
              <p>
                My work spans across production of narrative films, music videos, and high-end commercials, always with a focus on creating emotionally resonant and visually striking images. I believe that cinema is a powerful medium for empathy and understanding, and my creative vision is driven by a desire to explore the human condition in all its complexity.
              </p>
              <p>
                From the director's chair to behind the camera, I'm a collaborative and dedicated artist committed to bringing compelling stories to life. Based in Kenya, I draw inspiration from the vibrant landscapes and rich cultures of East Africa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;