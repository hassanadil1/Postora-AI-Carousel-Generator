export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          tier: string
          stripe_customer_id: string | null
          subscription_id: string | null
          subscription_end: string | null
          created_at: string
          last_login: string | null
          metadata: Record<string, any> | null
        }
        Insert: {
          auth_id: string
          email: string
          tier?: string
          stripe_customer_id?: string | null
          subscription_id?: string | null
          subscription_end?: string | null
          created_at?: string
          last_login?: string | null
          metadata?: Record<string, any> | null
        }
      }
      generations: {
        Row: {
          id: string
          user_id: string
          input_content: string
          output_format: string
          bullet_points: Record<string, any> | null
          canva_design_id: string | null
          status: string
          created_at: string
          deleted_at: string | null
        }
      }
      // Add other table types as needed
    }
  }
} 