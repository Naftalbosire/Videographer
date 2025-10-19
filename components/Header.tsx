import React, { useState, useRef } from 'react';
import { Section } from '../types';
import { NAV_LINKS } from '../constants';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  activeSection: Section;
  onNavClick: (section: Section) => void;
  isScrolled: boolean;
  onAdminUnlock: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavClick, isScrolled, onAdminUnlock }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const clickTimestamps = useRef<number[]>([]);

  const handleLogoClick = () => {
    const now = Date.now();
    clickTimestamps.current.push(now);

    // Keep only the last 3 timestamps
    if (clickTimestamps.current.length > 3) {
      clickTimestamps.current.shift();
    }

    // Check for 3 clicks within 700ms
    if (clickTimestamps.current.length === 3) {
      const [first, _, last] = clickTimestamps.current;
      if (last - first < 700) {
        clickTimestamps.current = []; // Reset after successful trigger
        onAdminUnlock();
        return; // Don't navigate to home
      }
    }

    onNavClick(Section.Home);
  };


  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        (isScrolled || isMenuOpen) ? 'bg-[#111111]/80 backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div
          className="text-2xl font-bold tracking-wider cursor-pointer"
          onClick={handleLogoClick}
        >
          <span className="font-serif">LUCY KADII</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex">
          <ul className="flex space-x-6 items-center">
            {NAV_LINKS.map((link) => (
              <li key={link.name}>
                <button
                  onClick={() => onNavClick(link.name)}
                  className={`text-sm uppercase tracking-widest transition-colors duration-300 relative group ${
                    activeSection === link.name
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute bottom-[-4px] left-0 w-full h-[1px] bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                      activeSection === link.name ? 'scale-x-100' : ''
                    }`}
                  ></span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown with Glass Effect */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul
          className={`flex flex-col items-center 
          bg-gradient-to-b from-[#1a1a1a]/70 via-[#111]/60 to-[#000]/70 
          backdrop-blur-md border-t border-gray-800 py-4 space-y-4`}
        >
          {NAV_LINKS.map((link) => (
            <li key={link.name}>
              <button
                onClick={() => {
                  onNavClick(link.name);
                  setIsMenuOpen(false);
                }}
                className={`text-sm uppercase tracking-widest transition-colors duration-300 ${
                  activeSection === link.name
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Header;