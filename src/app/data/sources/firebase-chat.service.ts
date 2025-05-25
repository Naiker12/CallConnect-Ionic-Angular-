import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  QuerySnapshot,
  DocumentData,
  where,
  limit
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from 'src/app/core/models/Message';
import { Chat } from 'src/app/core/services/chat.Service';


@Injectable({
  providedIn: 'root'
})
export class FirebaseChatService {
  constructor(private firestore: Firestore) {}

  async createOrGetChat(userId1: string, userId2: string): Promise<string> {
    const chatId = [userId1, userId2].sort().join('_');
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    
    const snapshot = await getDoc(chatRef);
    if (!snapshot.exists()) {
      const newChat: Partial<Chat> = {
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
        (snapshot: QuerySnapshot<DocumentData>) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() as Partial<Message>
          }));
          observer.next(messages as Message[]);
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
      'location': '📍 Ubicación',
      'file': '📎 Archivo'
    };
    return typeTexts[type] || 'Mensaje';
  }

}