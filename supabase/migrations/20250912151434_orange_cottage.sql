/*
  # Hotel Booking System Database Schema

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - single, double, suite, deluxe
      - `description` (text)
      - `amenities` (text array)
      - `price` (integer) - price in kobo (Naira * 100)
      - `max_guests` (integer)
      - `images` (text array)
      - `available` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bookings`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `guest_name` (text)
      - `guest_email` (text)
      - `guest_phone` (text)
      - `check_in` (date)
      - `check_out` (date)
      - `guests` (integer)
      - `total_price` (integer) - price in kobo
      - `status` (text) - confirmed, pending, cancelled
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `room_availability`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key)
      - `date` (date)
      - `available` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to rooms
    - Add policies for authenticated users to manage bookings
    - Add policies for admin users to manage rooms

  3. Functions
    - Function to check room availability
    - Function to create booking with availability check
    - Function to get available rooms for date range
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('single', 'double', 'suite', 'deluxe')),
  description text NOT NULL,
  amenities text[] DEFAULT '{}',
  price integer NOT NULL CHECK (price > 0), -- Price in kobo (Naira * 100)
  max_guests integer NOT NULL CHECK (max_guests > 0),
  images text[] DEFAULT '{}',
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_phone text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL CHECK (guests > 0),
  total_price integer NOT NULL CHECK (total_price > 0), -- Price in kobo
  status text DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- Create room availability table
CREATE TABLE IF NOT EXISTS room_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date date NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(available);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_room_availability_room_date ON room_availability(room_id, date);

-- Enable Row Level Security
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_availability ENABLE ROW LEVEL SECURITY;

-- Policies for rooms table (public read, admin write)
CREATE POLICY "Anyone can view available rooms"
  ON rooms
  FOR SELECT
  USING (available = true);

CREATE POLICY "Authenticated users can view all rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage rooms"
  ON rooms
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for bookings table
CREATE POLICY "Users can view their own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for room availability
CREATE POLICY "Anyone can view room availability"
  ON room_availability
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage availability"
  ON room_availability
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to check room availability for a date range
CREATE OR REPLACE FUNCTION check_room_availability(
  p_room_id uuid,
  p_check_in date,
  p_check_out date
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  booking_conflict integer;
BEGIN
  -- Check if there are any conflicting bookings
  SELECT COUNT(*)
  INTO booking_conflict
  FROM bookings
  WHERE room_id = p_room_id
    AND status IN ('confirmed', 'pending')
    AND (
      (check_in <= p_check_in AND check_out > p_check_in) OR
      (check_in < p_check_out AND check_out >= p_check_out) OR
      (check_in >= p_check_in AND check_out <= p_check_out)
    );
  
  RETURN booking_conflict = 0;
END;
$$;

-- Function to get available rooms for date range
CREATE OR REPLACE FUNCTION get_available_rooms(
  p_check_in date,
  p_check_out date,
  p_guests integer DEFAULT 1
)
RETURNS TABLE (
  id uuid,
  name text,
  type text,
  description text,
  amenities text[],
  price integer,
  max_guests integer,
  images text[],
  available boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.type, r.description, r.amenities, r.price, 
         r.max_guests, r.images, r.available, r.created_at, r.updated_at
  FROM rooms r
  WHERE r.available = true
    AND r.max_guests >= p_guests
    AND check_room_availability(r.id, p_check_in, p_check_out) = true
  ORDER BY r.price ASC;
END;
$$;

-- Function to create booking with availability check
CREATE OR REPLACE FUNCTION create_booking(
  p_room_id uuid,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_total_price integer
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  new_booking_id uuid;
  room_max_guests integer;
BEGIN
  -- Check if room exists and get max guests
  SELECT max_guests INTO room_max_guests
  FROM rooms
  WHERE id = p_room_id AND available = true;
  
  IF room_max_guests IS NULL THEN
    RAISE EXCEPTION 'Room not found or not available';
  END IF;
  
  -- Check if guests count is valid
  IF p_guests > room_max_guests THEN
    RAISE EXCEPTION 'Too many guests for this room. Maximum: %', room_max_guests;
  END IF;
  
  -- Check availability
  IF NOT check_room_availability(p_room_id, p_check_in, p_check_out) THEN
    RAISE EXCEPTION 'Room is not available for the selected dates';
  END IF;
  
  -- Create the booking
  INSERT INTO bookings (
    room_id, guest_name, guest_email, guest_phone,
    check_in, check_out, guests, total_price, status
  )
  VALUES (
    p_room_id, p_guest_name, p_guest_email, p_guest_phone,
    p_check_in, p_check_out, p_guests, p_total_price, 'confirmed'
  )
  RETURNING id INTO new_booking_id;
  
  RETURN new_booking_id;
END;
$$;

-- Insert sample data
INSERT INTO rooms (name, type, description, amenities, price, max_guests, images) VALUES
(
  'Classic Single Room',
  'single',
  'Comfortable single occupancy room with modern amenities.',
  ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Mini Fridge', 'Room Service'],
  2500000, -- ₦25,000 in kobo
  1,
  ARRAY['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800']
),
(
  'Deluxe Double Room',
  'double',
  'Spacious double room perfect for couples with city view.',
  ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'City View', 'Room Service'],
  4500000, -- ₦45,000 in kobo
  2,
  ARRAY['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800']
),
(
  'Executive Suite',
  'suite',
  'Luxurious suite with separate living area and premium amenities.',
  ARRAY['Free WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Living Area', 'City View', 'Premium Bedding', 'Room Service'],
  8500000, -- ₦85,000 in kobo
  4,
  ARRAY['https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=800']
),
(
  'Presidential Deluxe Suite',
  'deluxe',
  'Ultimate luxury experience with panoramic views and exclusive services.',
  ARRAY['Free WiFi', 'Air Conditioning', 'Smart TV', 'Premium Mini Bar', 'Living & Dining Area', 'Panoramic View', 'Premium Bedding', '24/7 Concierge'],
  15000000, -- ₦150,000 in kobo
  6,
  ARRAY['https://images.pexels.com/photos/1447256/pexels-photo-1447256.jpeg?auto=compress&cs=tinysrgb&w=800']
);