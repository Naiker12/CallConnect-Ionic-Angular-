export interface Message {
  id?: string;
  senderId: string;
  type: 'text' | 'image' | 'audio' | 'location' | 'file';
  content: string; // texto, URL o geohash
  timestamp: any; // Firebase Timestamp
  metadata?: {
    name?: string;
    size?: number;
    lat?: number;
    lng?: number;
    mimeType?: string;
  };
  // Estados del mensaje
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}