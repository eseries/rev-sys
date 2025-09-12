import { useState, useEffect } from 'react';
import { Booking, BookingFormData } from '../types';
import { bookingService } from '../services/bookingService';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookingService.getAllBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: BookingFormData, roomPrice: number) => {
    try {
      const newBooking = await bookingService.createBooking(bookingData, roomPrice);
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  const updateBookingStatus = async (id: string, status: 'confirmed' | 'pending' | 'cancelled') => {
    try {
      const updatedBooking = await bookingService.updateBookingStatus(id, status);
      setBookings(prev => prev.map(booking => booking.id === id ? updatedBooking : booking));
      return updatedBooking;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update booking');
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const cancelledBooking = await bookingService.cancelBooking(id);
      setBookings(prev => prev.map(booking => booking.id === id ? cancelledBooking : booking));
      return cancelledBooking;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
  };
};