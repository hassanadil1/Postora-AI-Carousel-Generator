export interface User {
  id: string;
  auth_id: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
  stripe_customer_id?: string;
  subscription_id?: string;
  subscription_end?: string;
  created_at: string;
  last_login?: string;
  metadata?: Record<string, any>;
}

export interface Generation {
  id: string;
  user_id: string;
  input_content: string;
  output_format: string;
  bullet_points?: Record<string, any>;
  canva_design_id?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  deleted_at?: string;
} 