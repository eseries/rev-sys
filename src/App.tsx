import React, { useState } from 'react';
import { Header } from './components/Header';
import { RoomGrid } from './components/RoomGrid';
import { BookingForm } from './components/BookingForm';
import { AdminPanel } from './components/AdminPanel';
import { Room, Booking, BookingFormData } from './types';
import { rooms as initialRooms, bookings as initialBookings } from './data/mockData';

type View = 'customer' | 'admin';
type CustomerView = 'rooms' | 'booking';

function App() {
  const [currentView, setCurrentView] = useState<View>('customer');
  const [customerView, setCustomerView] = useState<CustomerView>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setCustomerView('booking');
  };

  const handleBookingSubmit = (bookingData: BookingFormData) => {
    const newBooking: Booking = {
      id: `B${String(bookings.length + 1).padStart(3, '0')}`,
      roomId: bookingData.roomId,
      roomName: selectedRoom?.name || '',
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      guestPhone: bookingData.guestPhone,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalPrice: selectedRoom ? selectedRoom.price * Math.ceil(Math.abs(new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    setBookings([newBooking, ...bookings]);
  };

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setCustomerView('rooms');
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    if (view === 'customer') {
      setCustomerView('rooms');
      setSelectedRoom(null);
    }
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
    setRooms(rooms.map(room => room.id === updatedRoom.id ? updatedRoom : room));
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
  };

  const handleAddRoom = (roomData: Omit<Room, 'id'>) => {
    const newRoom: Room = {
      ...roomData,
      id: String(rooms.length + 1),
    };
    setRooms([...rooms, newRoom]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={handleViewChange} />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {currentView === 'customer' && (
          <>
            {customerView === 'rooms' && (
              <RoomGrid rooms={rooms} onRoomSelect={handleRoomSelect} />
            )}
            {customerView === 'booking' && selectedRoom && (
              <BookingForm
                room={selectedRoom}
                onBack={handleBackToRooms}
                onSubmit={handleBookingSubmit}
              />
            )}
          </>
        )}
        
        {currentView === 'admin' && (
          <AdminPanel
            rooms={rooms}
            bookings={bookings}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            onAddRoom={handleAddRoom}
          />
        )}
      </main>
    </div>
  );
}

export default App;