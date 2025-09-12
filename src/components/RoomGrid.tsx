import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Room } from '../types';
import { RoomCard } from './RoomCard';

interface RoomGridProps {
  rooms: Room[];
  onRoomSelect: (room: Room) => void;
}

export const RoomGrid: React.FC<RoomGridProps> = ({ rooms, onRoomSelect }) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Perfect Room</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Experience luxury and comfort with our carefully selected accommodations, 
          all priced affordably in Nigerian Naira.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rooms..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">All Room Types</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="suite">Suite</option>
              <option value="deluxe">Deluxe</option>
            </select>
            <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Price Range</option>
              <option value="0-30000">Under ₦30,000</option>
              <option value="30000-60000">₦30,000 - ₦60,000</option>
              <option value="60000-100000">₦60,000 - ₦100,000</option>
              <option value="100000+">Above ₦100,000</option>
            </select>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Filter className="h-4 w-4 inline mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onSelect={onRoomSelect} />
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
        </div>
      )}
    </div>
  );
};