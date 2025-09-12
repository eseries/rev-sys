import { supabase } from '../lib/supabase';
import { Booking, BookingFormData } from '../types';
import { calculateNights } from '../utils/date';

// Convert database booking to frontend booking format
const convertDbBookingToBooking = (dbBooking: any, roomName?: string): Booking => ({
  id: dbBooking.id,
  roomId: dbBooking.room_id,
  roomName: roomName || 'Unknown Room',
  guestName: dbBooking.guest_name,
  guestEmail: dbBooking.guest_email,
  guestPhone: dbBooking.guest_phone,
  checkIn: dbBooking.check_in,
  checkOut: dbBooking.check_out,
  guests: dbBooking.guests,
  totalPrice: Math.round(dbBooking.total_price / 100), // Convert from kobo to naira
  status: dbBooking.status,
  createdAt: dbBooking.created_at,
});

export const bookingService = {
  // Get all bookings with room information
  async getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings:', error);
      throw new Error('Failed to fetch bookings');
    }

    return data.map(booking => 
      convertDbBookingToBooking(booking, booking.rooms?.name)
    );
  },

  // Get booking by ID
  async getBookingById(id: string): Promise<Booking | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Booking not found
      }
      console.error('Error fetching booking:', error);
      throw new Error('Failed to fetch booking');
    }

    return convertDbBookingToBooking(data, data.rooms?.name);
  },

  // Create new booking
  async createBooking(bookingData: BookingFormData, roomPrice: number): Promise<Booking> {
    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    const totalPrice = roomPrice * nights;

    try {
      const { data, error } = await supabase
        .rpc('create_booking', {
          p_room_id: bookingData.roomId,
          p_guest_name: bookingData.guestName,
          p_guest_email: bookingData.guestEmail,
          p_guest_phone: bookingData.guestPhone,
          p_check_in: bookingData.checkIn,
          p_check_out: bookingData.checkOut,
          p_guests: bookingData.guests,
          p_total_price: totalPrice * 100, // Convert to kobo
        });

      if (error) {
        console.error('Error creating booking:', error);
        throw new Error(error.message || 'Failed to create booking');
      }

      // Fetch the created booking with room information
      const booking = await this.getBookingById(data);
      if (!booking) {
        throw new Error('Failed to retrieve created booking');
      }

      return booking;
    } catch (error) {
      console.error('Error in createBooking:', error);
      throw error;
    }
  },

  // Update booking status
  async updateBookingStatus(id: string, status: 'confirmed' | 'pending' | 'cancelled'): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        rooms (
          name
        )
      `)
      .single();

    if (error) {
      console.error('Error updating booking status:', error);
      throw new Error('Failed to update booking status');
    }

    return convertDbBookingToBooking(data, data.rooms?.name);
  },

  // Cancel booking
  async cancelBooking(id: string): Promise<Booking> {
    return this.updateBookingStatus(id, 'cancelled');
  },

  // Get bookings by guest email
  async getBookingsByEmail(email: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          name
        )
      `)
      .eq('guest_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookings by email:', error);
      throw new Error('Failed to fetch bookings');
    }

    return data.map(booking => 
      convertDbBookingToBooking(booking, booking.rooms?.name)
    );
  },

  // Get bookings for a specific room
  async getBookingsByRoom(roomId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        rooms (
          name
        )
      `)
      .eq('room_id', roomId)
      .in('status', ['confirmed', 'pending'])
      .order('check_in', { ascending: true });

    if (error) {
      console.error('Error fetching bookings by room:', error);
      throw new Error('Failed to fetch room bookings');
    }

    return data.map(booking => 
      convertDbBookingToBooking(booking, booking.rooms?.name)
    );
  },
};