export interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  user_id: string;
  floors: number;
}

export interface Image {
  id: string;
  project_id: string;
  url: string;
  created_at: string;
}

export interface Pin {
  id: string;
  image_id: string;
  x: number;
  y: number;
  metadata: Record<string, string>;
  created_at: string;
}