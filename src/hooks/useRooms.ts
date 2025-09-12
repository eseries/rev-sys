import { useState, useEffect } from 'react';
import { Room } from '../types';
import { roomService } from '../services/roomService';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomService.getAllRooms();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      const newRoom = await roomService.createRoom(roomData);
      setRooms(prev => [...prev, newRoom]);
      return newRoom;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create room');
    }
  };

  const updateRoom = async (id: string, roomData: Partial<Omit<Room, 'id'>>) => {
    try {
      const updatedRoom = await roomService.updateRoom(id, roomData);
      setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
      return updatedRoom;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update room');
    }
  };

  const deleteRoom = async (id: string) => {
    try {
      await roomService.deleteRoom(id);
      setRooms(prev => prev.filter(room => room.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete room');
    }
  };

  const getAvailableRooms = async (checkIn: string, checkOut: string, guests: number = 1) => {
    try {
      return await roomService.getAvailableRooms(checkIn, checkOut, guests);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch available rooms');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    getAvailableRooms,
  };
};