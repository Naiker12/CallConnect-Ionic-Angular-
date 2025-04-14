// src/models/notification.ts
export interface Notification {
    title: string;
    body: string;
    token: string;
    data?: {
      type?: 'video-call' | 'message';
      room?: string;
      [key: string]: any;
    };
  }
  