import { supabase } from '../lib/supabase';
import { Room } from '../types';

// Convert database room to frontend room format
const convertDbRoomToRoom = (dbRoom: any): Room => ({
  id: dbRoom.id,
  name: dbRoom.name,
  type: dbRoom.type,
  description: dbRoom.description,
  amenities: dbRoom.amenities || [],
  price: Math.round(dbRoom.price / 100), // Convert from kobo to naira
  maxGuests: dbRoom.max_guests,
  images: dbRoom.images || [],
  available: dbRoom.available,
});

// Convert frontend room to database format
const convertRoomToDbRoom = (room: Omit<Room, 'id'>) => ({
  name: room.name,
  type: room.type,
  description: room.description,
  amenities: room.amenities,
  price: room.price * 100, // Convert from naira to kobo
  max_guests: room.maxGuests,
  images: room.images,
  available: room.available,
});

export const roomService = {
  // Get all rooms
  async getAllRooms(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Failed to fetch rooms');
    }

    return data.map(convertDbRoomToRoom);
  },

  // Get available rooms for date range
  async getAvailableRooms(checkIn: string, checkOut: string, guests: number = 1): Promise<Room[]> {
    const { data, error } = await supabase
      .rpc('get_available_rooms', {
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_guests: guests,
      });

    if (error) {
      console.error('Error fetching available rooms:', error);
      throw new Error('Failed to fetch available rooms');
    }

    return data.map(convertDbRoomToRoom);
  },

  // Get room by ID
  async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Room not found
      }
      console.error('Error fetching room:', error);
      throw new Error('Failed to fetch room');
    }

    return convertDbRoomToRoom(data);
  },

  // Create new room
  async createRoom(room: Omit<Room, 'id'>): Promise<Room> {
    const dbRoom = convertRoomToDbRoom(room);
    
    const { data, error } = await supabase
      .from('rooms')
      .insert(dbRoom)
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw new Error('Failed to create room');
    }

    return convertDbRoomToRoom(data);
  },

  // Update room
  async updateRoom(id: string, room: Partial<Omit<Room, 'id'>>): Promise<Room> {
    const updateData: any = {};
    
    if (room.name !== undefined) updateData.name = room.name;
    if (room.type !== undefined) updateData.type = room.type;
    if (room.description !== undefined) updateData.description = room.description;
    if (room.amenities !== undefined) updateData.amenities = room.amenities;
    if (room.price !== undefined) updateData.price = room.price * 100; // Convert to kobo
    if (room.maxGuests !== undefined) updateData.max_guests = room.maxGuests;
    if (room.images !== undefined) updateData.images = room.images;
    if (room.available !== undefined) updateData.available = room.available;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      throw new Error('Failed to update room');
    }

    return convertDbRoomToRoom(data);
  },

  // Delete room
  async deleteRoom(id: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting room:', error);
      throw new Error('Failed to delete room');
    }
  },

  // Check room availability
  async checkAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('check_room_availability', {
        p_room_id: roomId,
        p_check_in: checkIn,
        p_check_out: checkOut,
      });

    if (error) {
      console.error('Error checking availability:', error);
      throw new Error('Failed to check availability');
    }

    return data;
  },
};