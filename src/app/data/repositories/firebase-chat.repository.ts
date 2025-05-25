import { Injectable } from '@angular/core';
import { Firestore, collection, query, orderBy, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc, onSnapshot, where, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from 'src/app/core/models/Message';
import { ChatInfo, ChatRepository } from 'src/app/domain/repositories/chat-repository';


@Injectable({
  providedIn: 'root'
})
export class FirebaseChatRepository implements ChatRepository {
  constructor(private firestore: Firestore) {}

  generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  async createOrGetChat(userId1: string, userId2: string): Promise<string> {
    const chatId = this.generateChatId(userId1, userId2);
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    
    const snapshot = await getDoc(chatRef);
    if (!snapshot.exists()) {
      const newChat: Partial<ChatInfo> = {
        users: [userId1, userId2],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageType: 'text',
        updatedAt: serverTimestamp(),
        unreadCount: {
          [userId1]: 0,
          [userId2]: 0
        }
      };
      await setDoc(chatRef, newChat);
    }
    return chatId;
  }

  listenToMessages(chatId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return new Observable<Message[]>(observer => {
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Partial<Message>
          }) as Message);
          observer.next(messages);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  async sendMessage(chatId: string, message: Message): Promise<void> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp()
    });
    await this.updateChatInfo(chatId, message);
  }

  async updateChatInfo(chatId: string, message: Message): Promise<void> {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    await updateDoc(chatRef, {
      lastMessage: message.type === 'text' ? message.content : this.getMessageTypeText(message.type),
      lastMessageTime: serverTimestamp(),
      lastMessageType: message.type,
      updatedAt: serverTimestamp()
    });
  }

  private getMessageTypeText(type: string): string {
    const typeTexts: Record<string, string> = {
      'image': '📷 Imagen',
      'audio': '🎵 Audio',
      'file': '📎 Archivo'
    };
    return typeTexts[type] || 'Mensaje';
  }

  getUserChats(userId: string): Observable<ChatInfo[]> {
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(
      chatsRef, 
      where('users', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return new Observable<ChatInfo[]>(observer => {
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Partial<ChatInfo>
          }) as ChatInfo);
          observer.next(chats);
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    await updateDoc(chatRef, {
      [`unreadCount.${userId}`]: 0
    });
  }

  getLastMessages(chatId: string, limitCount: number = 50): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return new Observable<Message[]>(observer => {
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Partial<Message>
          }) as Message);
          observer.next(messages.reverse());
        },
        error => observer.error(error)
      );
      return () => unsubscribe();
    });
  }

  async chatExists(chatId: string): Promise<boolean> {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    const snapshot = await getDoc(chatRef);
    return snapshot.exists();
  }

  async getChatInfo(chatId: string): Promise<ChatInfo | null> {
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    const snapshot = await getDoc(chatRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data() as Partial<ChatInfo>
      } as ChatInfo;
    }
    return null;
  }
}