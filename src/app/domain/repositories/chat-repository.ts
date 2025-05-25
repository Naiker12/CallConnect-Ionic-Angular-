import { Observable } from 'rxjs';
import { Message } from 'src/app/core/models/Message';

export interface ChatInfo {
  id: string;
  users: string[];
  lastMessage: string;
  lastMessageTime: any;
  lastMessageType: string;
  updatedAt: any;
  unreadCount?: { [userId: string]: number };
}

export interface ChatRepository {
  generateChatId(userId1: string, userId2: string): string;
  createOrGetChat(userId1: string, userId2: string): Promise<string>;
  listenToMessages(chatId: string): Observable<Message[]>;
  sendMessage(chatId: string, message: Message): Promise<void>;
  updateChatInfo(chatId: string, message: Message): Promise<void>;
  getUserChats(userId: string): Observable<ChatInfo[]>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;
  getLastMessages(chatId: string, limitCount?: number): Observable<Message[]>;
  chatExists(chatId: string): Promise<boolean>;
  getChatInfo(chatId: string): Promise<ChatInfo | null>;
}