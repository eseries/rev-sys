import React, { useState } from 'react';
import { Header } from './components/Header';
import { RoomGrid } from './components/RoomGrid';
import { BookingForm } from './components/BookingForm';
import { AdminPanel } from './components/AdminPanel';
import { Footer } from './components/Footer';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Room, Booking, BookingFormData } from './types';
import { useRooms } from './hooks/useRooms';
import { useBookings } from './hooks/useBookings';

type View = 'customer' | 'admin';
type CustomerView = 'rooms' | 'booking';

function App() {
  const [currentView, setCurrentView] = useState<View>('customer');
  const [customerView, setCustomerView] = useState<CustomerView>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  
  const {
    rooms,
    loading: roomsLoading,
    error: roomsError,
    createRoom,
    updateRoom,
    deleteRoom,
  } = useRooms();
  
  const {
    bookings,
    loading: bookingsLoading,
    error: bookingsError,
    createBooking,
  } = useBookings();

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setCustomerView('booking');
  };

  const handleBookingSubmit = async (bookingData: BookingFormData) => {
    if (!selectedRoom) return;
    
    try {
      await createBooking(bookingData, selectedRoom.price);
    } catch (error) {
      console.error('Failed to create booking:', error);
      // You might want to show an error message to the user here
    }
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

  const handleUpdateRoom = async (updatedRoom: Room) => {
    try {
      await updateRoom(updatedRoom.id, updatedRoom);
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
    } catch (error) {
      console.error('Failed to delete room:', error);
    }
  };

  const handleAddRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      await createRoom(roomData);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  // Show loading spinner while data is loading
  if (roomsLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentView={currentView} onViewChange={handleViewChange} />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  // Show error message if there's an error
  if (roomsError || bookingsError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header currentView={currentView} onViewChange={handleViewChange} />
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          <ErrorMessage message={roomsError || bookingsError || 'An error occurred'} />
        </main>
        <Footer />
      </div>
    );
  }

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
      
      <Footer />
    </div>
  );
}

export default App;