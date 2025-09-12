export interface Room {
  id: string;
  name: string;
  type: 'single' | 'double' | 'suite' | 'deluxe';
  description: string;
  amenities: string[];
  price: number; // Price in Naira
  maxGuests: number;
  images: string[];
  available: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface BookingFormData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}