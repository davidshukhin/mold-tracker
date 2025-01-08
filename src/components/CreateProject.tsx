import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export default function CreateProject() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState(1);

  async function handleCreateProject() {
    try {
      // Create the project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{ name: projectName, description: projectDescription }])
        .single();

      if (projectError) throw projectError;

      // Initialize floors
      const floors = Array.from({ length: numberOfFloors }, (_, index) => ({
        project_id: projectData.id,
        name: `Floor ${index + 1}`,
      }));

      const { error: floorsError } = await supabase
        .from('floors')
        .insert(floors);

      if (floorsError) throw floorsError;

      toast.success('Project created successfully!');
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
      <div className="mb-4">
        <label className="block text-gray-700">Project Name</label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="
      mb-4">
        <label className="block text-gray-700">Project Description</label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Number of Floors</label>
        <input
          type="number"
          min="1"
          value={numberOfFloors}
          onChange={(e) => setNumberOfFloors(Number(e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button
        onClick={handleCreateProject}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Create Project
      </button>
    </div>
  );
} 