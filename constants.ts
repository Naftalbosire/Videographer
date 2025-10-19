import type { Project } from './types';
import { Section } from './types';

export const NAV_LINKS = [
  { name: Section.Home, href: '#' },
  { name: Section.About, href: '#' },
  { name: Section.Showreel, href: '#' },
  { name: Section.Projects, href: '#' },
    { name: Section.Contact, href: '#' },
];

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Whispers of Influence',
    year: 2025,
    role: 'Director, Cinematographer',
    synopsis: 'A sci-fi short film exploring memory and loss on a desolate lunar outpost.',
    videoUrl: 'https://player.vimeo.com/video/194022743',
    thumbnailUrl: 'https://picsum.photos/seed/project1/800/600',
  },
  {
    id: 2,
    title: 'Dumpsite Guardian',
    year: 2025,
    role: 'Cinematographer',
    synopsis: 'Music video for the artist "Nova". A journey through a surreal, nocturnal cityscape.',
    videoUrl: 'https://player.vimeo.com/video/153979739',
    thumbnailUrl: 'https://picsum.photos/seed/project2/800/600',
  },
  {
    id: 3,
    title: 'Artisan',
    year: 2025,
    role: 'Director, Editor',
    synopsis: 'A short documentary profiling a master watchmaker and his dedication to craft.',
    videoUrl: 'https://player.vimeo.com/video/212849514',
    thumbnailUrl: 'https://picsum.photos/seed/project3/800/600',
  },
  {
    id: 4,
    title: 'The Wanderer',
    year: 2025,
    role: 'Director of Photography',
    synopsis: 'Commercial for a luxury travel brand, capturing the spirit of adventure.',
    videoUrl: 'https://player.vimeo.com/video/239832607',
    thumbnailUrl: 'https://picsum.photos/seed/project4/800/600',
  },
  {
    id: 5,
    title: 'Crimson Tide',
    year: 2025,
    role: 'Editor',
    synopsis: 'A gripping thriller that unfolds in real-time on a deserted coastline.',
    videoUrl: 'https://player.vimeo.com/video/198886804',
    thumbnailUrl: 'https://picsum.photos/seed/project5/800/600',
  },
  {
    id: 6,
    title: 'City Lights',
    year: 2015,
    role: 'Cinematographer',
    synopsis: 'A visual poem dedicated to the dynamic energy of New York City after dark.',
    videoUrl: 'https://player.vimeo.com/video/247753577',
    thumbnailUrl: 'https://picsum.photos/seed/project6/800/600',
  },
];