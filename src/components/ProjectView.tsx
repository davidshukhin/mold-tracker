import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Camera, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Project, Image } from '../types';
import { toast } from 'react-hot-toast';
import FloorButton from './FloorButton';



export default function ProjectView() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject();
      loadImages();
    }
  }, [id]);

  async function loadProject() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      console.log('Project data:', data);
      setProject(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function loadImages() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('interior-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('interior-images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('images')
        .insert([{ project_id: id, url: publicUrl }]);

      if (dbError) {
        console.error('Database Error:', dbError);
        throw dbError;
      }

      loadImages();
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload Error:', error);
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
        {project.description && (
          <p className="text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4">
          <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <label className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer">
            <Camera className="w-4 h-4 mr-2" />
            Take Photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: project.floors }).map((_, floorIndex) => (
          <FloorButton key={floorIndex} floorNumber={floorIndex + 1} projectId={id} />
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-500">Upload images or take photos to get started!</p>
        </div>
      )}
    </div>
  );
}