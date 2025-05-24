import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  orderBy,
  collectionData,
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
  limit,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { Message } from '../models/Message';


export interface Chat {
  id: string;
  users: string[];
  lastMessage: string;
  lastMessageTime: any;
  lastMessageType: string;
  updatedAt: any;
  unreadCount?: { [userId: string]: number };
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private currentChatId: string | null = null;
  private messagesSubject = new BehaviorSubject<Message[]>([]);

  constructor(private firestore: Firestore) {}

  /**
   * Genera un ID único para el chat basado en los IDs de usuario
   */
  generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  /**
   * Crea o obtiene un chat existente entre dos usuarios
   */
  async createOrGetChat(userId1: string, userId2: string): Promise<string> {
    const chatId = this.generateChatId(userId1, userId2);
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    
    try {
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
        console.log('Nuevo chat creado:', chatId);
      }
      
      this.currentChatId = chatId;
      return chatId;
    } catch (error) {
      console.error('Error creando/obteniendo chat:', error);
      throw error;
    }
  }

  /**
   * Escucha los mensajes de un chat en tiempo real
   */
  listenToMessages(chatId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return new Observable<Message[]>((observer) => {
      const unsubscribe = onSnapshot(q, 
        (snapshot: QuerySnapshot<DocumentData>) => {
          const messages: Message[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
              id: doc.id,
              senderId: data['senderId'],
              type: data['type'] || 'text',
              content: data['content'] || '',
              timestamp: data['timestamp'],
              metadata: data['metadata'],
              status: data['status'] || 'sent'
            });
          });
          
          observer.next(messages);
        },
        (error) => {
          console.error('Error escuchando mensajes:', error);
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }

  /**
   * Envía un mensaje al chat
   */
  async sendMessage(chatId: string, message: Message): Promise<void> {
    try {
      const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
      
      // Preparar el mensaje para enviar
      const messageToSend = {
        senderId: message.senderId,
        type: message.type,
        content: message.content,
        timestamp: serverTimestamp(),
        status: 'sent',
        metadata: message.metadata || null
      };

      // Agregar mensaje a la colección
      await addDoc(messagesRef, messageToSend);
      
      // Actualizar información del chat
      await this.updateChatInfo(chatId, message);
      
      console.log('Mensaje enviado exitosamente');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  }

  /**
   * Actualiza la información del chat con el último mensaje
   */
  private async updateChatInfo(chatId: string, message: Message): Promise<void> {
    try {
      const chatRef = doc(this.firestore, `chats/${chatId}`);
      
      await updateDoc(chatRef, {
        lastMessage: message.type === 'text' ? message.content : this.getMessageTypeText(message.type),
        lastMessageTime: serverTimestamp(),
        lastMessageType: message.type,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error actualizando info del chat:', error);
    }
  }

  /**
   * Obtiene texto descriptivo para tipos de mensaje no textuales
   */
  private getMessageTypeText(type: string): string {
    const typeTexts: Record<string, string> = {
      'image': '📷 Imagen',
      'audio': '🎵 Audio',
      'location': '📍 Ubicación',
      'file': '📎 Archivo'
    };
    return typeTexts[type] || 'Mensaje';
  }

  /**
   * Obtiene los chats de un usuario
   */
  getUserChats(userId: string): Observable<Chat[]> {
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(
      chatsRef, 
      where('users', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    
    return new Observable<Chat[]>((observer) => {
      const unsubscribe = onSnapshot(q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const chats: Chat[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            chats.push({
              id: doc.id,
              users: data['users'] || [],
              lastMessage: data['lastMessage'] || '',
              lastMessageTime: data['lastMessageTime'],
              lastMessageType: data['lastMessageType'] || 'text',
              updatedAt: data['updatedAt'],
              unreadCount: data['unreadCount'] || {}
            });
          });
          
          observer.next(chats);
        },
        (error) => {
          console.error('Error obteniendo chats del usuario:', error);
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }

  /**
   * Marca los mensajes como leídos
   */
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const chatRef = doc(this.firestore, `chats/${chatId}`);
      await updateDoc(chatRef, {
        [`unreadCount.${userId}`]: 0
      });
    } catch (error) {
      console.error('Error marcando mensajes como leídos:', error);
    }
  }

  /**
   * Obtiene los últimos mensajes de un chat
   */
  getLastMessages(chatId: string, limitCount: number = 50): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(
      messagesRef, 
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return new Observable<Message[]>((observer) => {
      const unsubscribe = onSnapshot(q,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const messages: Message[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
              id: doc.id,
              senderId: data['senderId'],
              type: data['type'] || 'text',
              content: data['content'] || '',
              timestamp: data['timestamp'],
              metadata: data['metadata'],
              status: data['status'] || 'sent'
            });
          });
          
          // Revertir el orden para mostrar mensajes más antiguos primero
          observer.next(messages.reverse());
        },
        (error) => {
          console.error('Error obteniendo últimos mensajes:', error);
          observer.error(error);
        }
      );
      
      return () => unsubscribe();
    });
  }

  /**
   * Verifica si un chat existe
   */
  async chatExists(chatId: string): Promise<boolean> {
    try {
      const chatRef = doc(this.firestore, `chats/${chatId}`);
      const snapshot = await getDoc(chatRef);
      return snapshot.exists();
    } catch (error) {
      console.error('Error verificando existencia del chat:', error);
      return false;
    }
  }

  /**
   * Obtiene información del chat
   */
  async getChatInfo(chatId: string): Promise<Chat | null> {
    try {
      const chatRef = doc(this.firestore, `chats/${chatId}`);
      const snapshot = await getDoc(chatRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: snapshot.id,
          users: data['users'] || [],
          lastMessage: data['lastMessage'] || '',
          lastMessageTime: data['lastMessageTime'],
          lastMessageType: data['lastMessageType'] || 'text',
          updatedAt: data['updatedAt'],
          unreadCount: data['unreadCount'] || {}
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo información del chat:', error);
      return null;
    }
  }

  /**
   * Limpia recursos y suscripciones
   */
  cleanup(): void {
    this.currentChatId = null;
    this.messagesSubject.next([]);
  }
}