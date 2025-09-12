import React from 'react';
import { Users, Wifi, AirVent, Tv, Car } from 'lucide-react';
import { Room } from '../types';
import { formatNaira } from '../utils/currency';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
}

const amenityIcons: { [key: string]: React.ReactNode } = {
  'Free WiFi': <Wifi className="h-4 w-4" />,
  'Air Conditioning': <AirVent className="h-4 w-4" />,
  'TV': <Tv className="h-4 w-4" />,
  'Smart TV': <Tv className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
};

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={room.images[0]}
          alt={room.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            {room.type}
          </span>
        </div>
        {room.available && (
          <div className="absolute top-4 right-4">
            <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Available
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{room.description}</p>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center text-gray-500 text-sm">
            <Users className="h-4 w-4 mr-1" />
            Up to {room.maxGuests} guests
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {room.amenities.slice(0, 4).map((amenity) => (
              <div
                key={amenity}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700"
              >
                {amenityIcons[amenity]}
                {amenity}
              </div>
            ))}
            {room.amenities.length > 4 && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                +{room.amenities.length - 4} more
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">{formatNaira(room.price)}</span>
            <span className="text-gray-500 text-sm"> /night</span>
          </div>
          <button
            onClick={() => onSelect(room)}
            disabled={!room.available}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {room.available ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};