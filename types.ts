export enum Section {
  Home = 'Home',
  Showreel = 'Showreel',
  Projects = 'Projects',
  About = 'About',
  Contact = 'Contact'
}

export interface Project {
  _id?: string; // MongoDB will use _id, not id
  id?: number; // kept for backward compatibility if needed
  title: string;
  year: number;
  role: string;
  synopsis: string;
  videoUrl: string;
  thumbnailUrl: string;
}

/**
 * Type for creating or editing a new project.
 * It mirrors `Project` but without the Mongo `_id` or optional fields.
 */
export type NewProjectType = Omit<Project, '_id' | 'id'>;
