export interface Member {
  id: number;
  card_number: string;
  full_name: string;
  phone_number?: string;
  expiry_date: string;
  days_left: number; // Это поле считает Django
  amount_paid?: number;
  is_frozen?: boolean;
  freeze_until?: string | null;
  status_color?: string; // 'red' | 'yellow' | 'blue' | 'green'
  created_at: string;
}

export interface Trainer {
  id: number;
  full_name: string;
  specialty: string;
  photo_url: string;
  is_active: boolean;
  notes: string;
  clients_count?: number;
  created_at: string;
}
