import React from 'react';
import { Link } from 'react-router-dom';

interface FloorButtonProps {
  floorNumber: number;
  projectId: string;
}

const FloorButton: React.FC<FloorButtonProps> = ({ floorNumber, projectId }) => {
  return (
    <Link
      to={`/project/${projectId}/floor/${floorNumber}`}
      className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
    >
      <h2 className="text-xl font-semibold text-gray-800">Floor {floorNumber}</h2>
    </Link>
  );
};

export default FloorButton; 