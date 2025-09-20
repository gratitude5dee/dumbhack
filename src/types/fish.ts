export interface Fish {
  id: string;
  user_id?: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  drawing_data?: any;
  ai_score?: number | null;
  ai_confidence?: number | null;
  is_fish: boolean;
  is_visible: boolean;
  is_approved: boolean;
  flagged_for_review: boolean;
  vote_count: number;
  upvotes: number;
  downvotes: number;
  view_count: number;
  client_fingerprint?: string | null;
  drawing_duration?: number | null;
  canvas_dimensions?: any; // Using any to match Json type from Supabase
  user_name?: string | null;
  phone_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  fish_id: string;
  user_id?: string;
  client_fingerprint?: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface AnonymousSession {
  id: string;
  fingerprint: string;
  fish_created: number;
  votes_cast: number;
  last_active: string;
  created_at: string;
}

export interface DrawingData {
  strokes: Stroke[];
  dimensions: {
    width: number;
    height: number;
  };
  duration: number;
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: 'pen' | 'eraser';
  timestamp: number;
}

export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type SortOption = 'recent' | 'popular' | 'random' | 'hot';
export type FilterOption = 'all' | 'fish-only' | 'high-score';