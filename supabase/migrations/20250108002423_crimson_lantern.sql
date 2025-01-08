/*
  # Interior Tracker Schema

  1. New Tables
    - projects
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - user_id (uuid, references auth.users)
      - created_at (timestamp)
    
    - images
      - id (uuid, primary key)
      - project_id (uuid, references projects)
      - url (text)
      - created_at (timestamp)
    
    - pins
      - id (uuid, primary key)
      - image_id (uuid, references images)
      - x (float)
      - y (float)
      - metadata (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create tables
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid REFERENCES images ON DELETE CASCADE NOT NULL,
  x float NOT NULL,
  y float NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage images in their projects"
  ON images
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = images.project_id 
    AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = images.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage pins on their images"
  ON pins
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM images 
    JOIN projects ON images.project_id = projects.id
    WHERE images.id = pins.image_id 
    AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM images 
    JOIN projects ON images.project_id = projects.id
    WHERE images.id = pins.image_id 
    AND projects.user_id = auth.uid()
  ));