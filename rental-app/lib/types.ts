export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            items: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    description: string
                    price_per_day: number
                    category: string
                    images: string[]
                    location: string
                    latitude: number | null
                    longitude: number | null
                    user_id: string
                    is_available: boolean
                    specs: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    description: string
                    price_per_day: number
                    category: string
                    images?: string[]
                    location: string
                    latitude?: number | null
                    longitude?: number | null
                    user_id: string
                    is_available?: boolean
                    specs?: Json | null
                }
                Update: Partial<Database['public']['Tables']['items']['Insert']>
            }
            bookings: {
                Row: {
                    id: string
                    created_at: string
                    item_id: string
                    renter_id: string
                    owner_id: string
                    start_date: string
                    end_date: string
                    total_price: number
                    status: 'pending' | 'active' | 'completed' | 'cancelled'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    item_id: string
                    renter_id: string
                    owner_id: string
                    start_date: string
                    end_date: string
                    total_price: number
                    status?: 'pending' | 'active' | 'completed' | 'cancelled'
                }
                Update: Partial<Database['public']['Tables']['bookings']['Insert']>
            }
            profiles: {
                Row: {
                    id: string
                    created_at: string
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    location: string | null
                    phone: string | null
                }
                Insert: {
                    id: string
                    created_at?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    location?: string | null
                    phone?: string | null
                }
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>
            }
        }
    }
}
