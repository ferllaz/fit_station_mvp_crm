export interface Member {
  id: number;
  card_number: string;
  full_name: string;
  phone_number?: string;
  expiry_date: string;
  days_left: number; // Это поле считает Django
  amount_paid?: number;
  created_at: string;
}