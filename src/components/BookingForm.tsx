import React, { useState } from 'react';
import { ArrowLeft, Calendar, Users, CreditCard, Check } from 'lucide-react';
import { Room, BookingFormData } from '../types';
import { formatNaira } from '../utils/currency';
import { calculateNights, formatDate, getTodayDate, getTomorrowDate } from '../utils/date';

interface BookingFormProps {
  room: Room;
  onBack: () => void;
  onSubmit: (bookingData: BookingFormData) => Promise<void>;
}

export const BookingForm: React.FC<BookingFormProps> = ({ room, onBack, onSubmit }) => {
  const [step, setStep] = useState<'dates' | 'details' | 'payment' | 'confirmation'>('dates');
  const [formData, setFormData] = useState<BookingFormData>({
    roomId: room.id,
    checkIn: getTodayDate(),
    checkOut: getTomorrowDate(),
    guests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
  });

  const nights = calculateNights(formData.checkIn, formData.checkOut);
  const totalPrice = room.price * nights;

  const handleNext = () => {
    if (step === 'dates') setStep('details');
    else if (step === 'details') setStep('payment');
    else if (step === 'payment') {
      handleSubmitBooking();
    }
  };

  const handleSubmitBooking = async () => {
    try {
      await onSubmit({ ...formData });
      setStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      // You might want to show an error message here
    }
  };

  const canProceed = () => {
    if (step === 'dates') return formData.checkIn && formData.checkOut && nights > 0;
    if (step === 'details') return formData.guestName && formData.guestEmail && formData.guestPhone;
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Rooms
        </button>
        <h2 className="text-2xl font-bold mb-2">{room.name}</h2>
        <p className="text-blue-100">{room.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {['dates', 'details', 'payment', 'confirmation'].map((currentStep, index) => (
            <div key={currentStep} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : index < ['dates', 'details', 'payment', 'confirmation'].indexOf(step)
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < ['dates', 'details', 'payment', 'confirmation'].indexOf(step) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    index < ['dates', 'details', 'payment', 'confirmation'].indexOf(step)
                      ? 'bg-emerald-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {step === 'dates' && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Select Dates & Guests</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={formData.checkIn}
                  min={getTodayDate()}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={formData.checkOut}
                  min={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="h-4 w-4 inline mr-2" />
                  Guests
                </label>
                <select
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: room.maxGuests }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {nights > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {formatDate(formData.checkIn)} - {formatDate(formData.checkOut)}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {nights} {nights === 1 ? 'night' : 'nights'} • {formData.guests} {formData.guests === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{formatNaira(totalPrice)}</p>
                    <p className="text-sm text-gray-600">{formatNaira(room.price)} × {nights} nights</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'details' && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Guest Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.guestEmail}
                  onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.guestPhone}
                  onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+234 XXX XXX XXXX"
                />
              </div>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <CreditCard className="h-4 w-4 inline mr-2" />
                This is a demo. In production, integrate with Paystack or Flutterwave for real payments.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span className="font-medium">{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dates:</span>
                  <span>{formatDate(formData.checkIn)} - {formatDate(formData.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{formData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nights:</span>
                  <span>{nights}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatNaira(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h3>
            <p className="text-gray-600 mb-6">
              Your reservation has been successfully created. You will receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h4 className="font-semibold text-gray-900 mb-4">Booking Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Guest:</span>
                  <span className="font-medium">{formData.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span>{room.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{formatDate(formData.checkIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{formatDate(formData.checkOut)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Paid:</span>
                  <span className="font-bold text-emerald-600">{formatNaira(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {step !== 'confirmation' && (
          <div className="flex justify-end mt-8">
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              {step === 'payment' ? 'Complete Booking' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};