export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          name: string
          type: 'single' | 'double' | 'suite' | 'deluxe'
          description: string
          amenities: string[]
          price: number
          max_guests: number
          images: string[]
          available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'single' | 'double' | 'suite' | 'deluxe'
          description: string
          amenities?: string[]
          price: number
          max_guests: number
          images?: string[]
          available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'single' | 'double' | 'suite' | 'deluxe'
          description?: string
          amenities?: string[]
          price?: number
          max_guests?: number
          images?: string[]
          available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status: 'confirmed' | 'pending' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          guest_name: string
          guest_email: string
          guest_phone: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status?: 'confirmed' | 'pending' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          check_in?: string
          check_out?: string
          guests?: number
          total_price?: number
          status?: 'confirmed' | 'pending' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      room_availability: {
        Row: {
          id: string
          room_id: string
          date: string
          available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          date: string
          available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          date?: string
          available?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_room_availability: {
        Args: {
          p_room_id: string
          p_check_in: string
          p_check_out: string
        }
        Returns: boolean
      }
      get_available_rooms: {
        Args: {
          p_check_in: string
          p_check_out: string
          p_guests?: number
        }
        Returns: {
          id: string
          name: string
          type: string
          description: string
          amenities: string[]
          price: number
          max_guests: number
          images: string[]
          available: boolean
          created_at: string
          updated_at: string
        }[]
      }
      create_booking: {
        Args: {
          p_room_id: string
          p_guest_name: string
          p_guest_email: string
          p_guest_phone: string
          p_check_in: string
          p_check_out: string
          p_guests: number
          p_total_price: number
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}