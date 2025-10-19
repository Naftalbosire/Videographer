import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#111111] text-center py-8 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Lucy Kadii. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;