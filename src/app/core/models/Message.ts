export interface Message {
  id?: string;
  senderId: string;
  type: 'text' | 'image' | 'audio' | 'location' | 'file';
  content: string;
  timestamp: any;
  metadata?: {
    name?: string;
    size?: number;
    lat?: number;
    lng?: number;
    mimeType?: string;
  };
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}