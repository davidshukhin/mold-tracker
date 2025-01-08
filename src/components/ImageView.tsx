import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Image, Pin } from '../types';
import { toast } from 'react-hot-toast';

export default function ImageView() {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<Image | null>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [newMetadata, setNewMetadata] = useState<{ key: string; value: string }>({ key: '', value: '' });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (id) {
      loadImage();
      loadPins();
    }
  }, [id]);

  async function loadImage() {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setImage(data);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function loadPins() {
    try {
      const { data, error } = await supabase
        .from('pins')
        .select('*')
        .eq('image_id', id);

      if (error) throw error;
      setPins(data || []);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleImageClick(e: React.MouseEvent<HTMLImageElement>) {
    if (!imageRef.current || showPinForm) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    try {
      const { data, error } = await supabase
        .from('pins')
        .insert([{ image_id: id, x, y, metadata: {} }])
        .select()
        .single();

      if (error) throw error;
      setPins([...pins, data]);
      setSelectedPin(data);
      setShowPinForm(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleAddMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPin) return;

    try {
      const updatedMetadata = {
        ...selectedPin.metadata,
        [newMetadata.key]: newMetadata.value,
      };

      const { error } = await supabase
        .from('pins')
        .update({ metadata: updatedMetadata })
        .eq('id', selectedPin.id);

      if (error) throw error;

      setPins(pins.map(pin => 
        pin.id === selectedPin.id 
          ? { ...pin, metadata: updatedMetadata }
          : pin
      ));

      setNewMetadata({ key: '', value: '' });
      toast.success('Metadata added successfully!');
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  if (!image) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="relative">
        <img
          ref={imageRef}
          src={image.url}
          alt="Interior"
          onClick={handleImageClick}
          className="w-full h-auto rounded-lg shadow-lg cursor-crosshair"
        />
        {pins.map((pin) => (
          <button
            key={pin.id}
            onClick={() => {
              setSelectedPin(pin);
              setShowPinForm(true);
            }}
            className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full bg-indigo-600 border-2 border-white shadow-md hover:bg-indigo-700 transition-colors ${
              selectedPin?.id === pin.id ? 'ring-2 ring-indigo-300' : ''
            }`}
            style={{
              left: `${pin.x * 100}%`,
              top: `${pin.y * 100}%`,
            }}
          />
        ))}
      </div>

      {showPinForm && selectedPin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Pin Details</h3>
              <button
                onClick={() => {
                  setShowPinForm(false);
                  setSelectedPin(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Current Metadata</h4>
              {Object.entries(selectedPin.metadata).length > 0 ? (
                <dl className="space-y-1">
                  {Object.entries(selectedPin.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <dt className="font-medium text-gray-500">{key}:</dt>
                      <dd className="text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-sm text-gray-500">No metadata added yet</p>
              )}
            </div>

            <form onSubmit={handleAddMetadata} className="space-y-4">
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                  Key
                </label>
                <input
                  type="text"
                  id="key"
                  required
                  value={newMetadata.key}
                  onChange={(e) => setNewMetadata({ ...newMetadata, key: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="value" className="block text-sm font-medium text-gray-700">
                  Value
                </label>
                <input
                  type="text"
                  id="value"
                  required
                  value={newMetadata.value}
                  onChange={(e) => setNewMetadata({ ...newMetadata, value: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Metadata
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}