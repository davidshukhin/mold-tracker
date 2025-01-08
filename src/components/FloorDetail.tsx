import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Room {
  id: string;
  name: string;
  imageUrl: string; // Assuming each room has an image URL
}

const FloorDetail: React.FC = () => {
  const { projectId, floorNumber } = useParams<{ projectId: string; floorNumber: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomImage, setNewRoomImage] = useState<File | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const response = await fetch(`/api/projects/${projectId}/floors/${floorNumber}/rooms`);
        const data = await response.json();
        setRooms(data);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, [projectId, floorNumber]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName || !newRoomImage) return;

    const formData = new FormData();
    formData.append('name', newRoomName);
    formData.append('image', newRoomImage);

    try {
      const response = await fetch(`/api/projects/${projectId}/floors/${floorNumber}/rooms`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create room');

      const newRoom = await response.json();
      setRooms([...rooms, newRoom]);
      setNewRoomName('');
      setNewRoomImage(null);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Floor {floorNumber} Gallery</h2>

      {/* Form to create a new room */}
      <form onSubmit={handleCreateRoom} className="mb-4">
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="Enter room name"
          className="p-2 border border-gray-300 rounded-md mr-2"
        />
        <input
          type="file"
          onChange={(e) => setNewRoomImage(e.target.files ? e.target.files[0] : null)}
          className="p-2 border border-gray-300 rounded-md mr-2"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded-md">
          Add Room
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img src={room.imageUrl} alt={room.name} className="w-full h-48 object-cover rounded-md" />
            <h3 className="text-lg font-medium text-gray-900 mt-2">{room.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorDetail; 