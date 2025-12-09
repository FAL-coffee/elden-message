export interface Message {
  id: string;
  url: string;
  url_hash: string;
  x_position: number;
  y_position: number;
  message_text: string;
  base_template: string;
  category: string;
  word: string;
  rating_count: number;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  message_id: string;
  user_id: string;
  created_at: string;
}

export interface MessageCreate {
  url: string;
  url_hash: string;
  x_position: number;
  y_position: number;
  message_text: string;
  base_template: string;
  category: string;
  word: string;
  creator_id: string;
}

export interface MessageFormData {
  baseTemplate: string;
  category: string;
  word: string;
}
