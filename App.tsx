import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeSection from './components/sections/HomeSection';
import ShowreelSection from './components/sections/ShowreelSection';
import ProjectsSection from './components/sections/ProjectsSection';
import AboutSection from './components/sections/AboutSection';
import ContactSection from './components/sections/ContactSection';
import AdminModal from './components/AdminModal';
import { Section, Project } from './types';
import AnimatedSection from './components/AnimatedSection';

const BACKEND_URL = "https://videographer.onrender.com"; // <- Added backend URL

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Home);
  const [isScrolled, setIsScrolled] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);

  const sectionRefs = {
    [Section.Home]: useRef<HTMLDivElement>(null),
    [Section.Showreel]: useRef<HTMLDivElement>(null),
    [Section.Projects]: useRef<HTMLDivElement>(null),
    [Section.About]: useRef<HTMLDivElement>(null),
    [Section.Contact]: useRef<HTMLDivElement>(null),
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/projects`); // <- Updated
      if (!response.ok) throw new Error('Network response was not ok');
      const data: Project[] = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const checkLoginStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/status`, { credentials: 'include' }); // <- Updated
      const data = await response.json();
      if (data.loggedIn) setIsAdminUnlocked(true);
    } catch (e) {
      console.error("Could not verify login status", e);
    }
  };

  useEffect(() => {
    fetchProjects();
    checkLoginStatus();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      Object.entries(sectionRefs).forEach(([section, ref]) => {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section as Section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sectionRefs]);

  const handleNavClick = (section: Section) => {
    sectionRefs[section].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  const handleAdminUnlock = () => setIsAdminOpen(true);
  const handleAdminClose = () => setIsAdminOpen(false);

  const handleLogin = async (password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/login`, { // <- Updated
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      if (response.ok) {
        setIsAdminUnlocked(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/admin/logout`, { method: 'POST', credentials: 'include' }); // <- Updated
    } finally {
      setIsAdminUnlocked(false);
      setIsAdminOpen(false);
    }
  };

  const renderSection = (section: Section, content: React.ReactNode) => (
    <div ref={sectionRefs[section]} id={section.toLowerCase()}>
      <AnimatedSection>{content}</AnimatedSection>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] text-white font-sans antialiased">
      <Header
        activeSection={activeSection}
        onNavClick={handleNavClick}
        isScrolled={isScrolled}
        onAdminUnlock={handleAdminUnlock}
      />
      <main>
        {renderSection(Section.Home, <HomeSection />)}
        {renderSection(Section.Showreel, <ShowreelSection />)}
        {renderSection(Section.Projects, <ProjectsSection projects={projects} isLoading={isLoading} error={error} />)}
        {renderSection(Section.About, <AboutSection />)}
        {renderSection(Section.Contact, <ContactSection />)}
      </main>
      <Footer />
      <AdminModal
        isOpen={isAdminOpen}
        onClose={handleAdminClose}
        isUnlocked={isAdminUnlocked}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onProjectsUpdate={fetchProjects}
      />
    </div>
  );
};

export default App;
