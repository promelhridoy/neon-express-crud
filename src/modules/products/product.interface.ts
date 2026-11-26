export interface IProduct {
  id?: number;
  user_id: number;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  category?: string;
  created_at?: Date;
  updated_at?: Date;
}