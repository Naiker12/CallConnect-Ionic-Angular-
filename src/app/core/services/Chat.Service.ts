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
  where
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Message } from '../models/Message';
import { SupabaseService } from './supabase.service';
import { CustomToastService } from './custom-toast.service';
import { LoadingService } from './loading.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export interface Chat {
  id: string;
  users: string[];
  lastMessage: string;
  updatedAt: any;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(
    private firestore: Firestore,
    private supabaseService: SupabaseService,
    private toastService: CustomToastService,
    private loadingService: LoadingService
  ) {}

  generateChatId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  async createOrGetChat(userId1: string, userId2: string): Promise<string> {
    const chatId = this.generateChatId(userId1, userId2);
    const chatRef = doc(this.firestore, `chats/${chatId}`);
    const snapshot = await getDoc(chatRef);
    
    if (!snapshot.exists()) {
      await setDoc(chatRef, {
        users: [userId1, userId2],
        lastMessage: '',
        updatedAt: serverTimestamp(),
      });
    }
    return chatId;
  }

  listenToMessages(chatId: string): Observable<Message[]> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }

  async sendMessage(chatId: string, message: Message): Promise<void> {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    await addDoc(messagesRef, {
      ...message,
      timestamp: serverTimestamp(),
    });


    const chatRef = doc(this.firestore, `chats/${chatId}`);
    await setDoc(
      chatRef,
      {
        lastMessage: message.type === 'text' ? message.content : this.getMessageTypeText(message.type),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  getUserChats(userId: string): Observable<Chat[]> {
    const chatsRef = collection(this.firestore, 'chats');
    const q = query(
      chatsRef, 
      where('users', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Chat[]>;
  }

  async sendImageFromCamera(chatId: string, senderId: string): Promise<void> {
    try {
      await this.loadingService.show('Abriendo cámara...');

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        saveToGallery: false
      });

      await this.loadingService.hide();

      if (image.dataUrl) {
        await this.loadingService.show('Procesando imagen...');

        const file = await this.dataUrlToFile(image.dataUrl, `camera_${Date.now()}.jpg`);
        
        await this.sendImageFile(chatId, senderId, file);
      }
    } catch (error) {
      console.error('Error tomando foto:', error);
      await this.loadingService.hide();
      
      if (error instanceof Error && error.message.includes('cancelled')) {
        await this.toastService.info('Captura de foto cancelada');
      } else {
        await this.toastService.error('Error al tomar la foto');
      }
      throw error;
    }
  }

  async sendImageFromGallery(chatId: string, senderId: string): Promise<void> {
    try {
      await this.loadingService.show('Abriendo galería...');

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });

      await this.loadingService.hide();

      if (image.dataUrl) {
        await this.loadingService.show('Procesando imagen...');

        const file = await this.dataUrlToFile(image.dataUrl, `gallery_${Date.now()}.jpg`);
      
        await this.sendImageFile(chatId, senderId, file);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      await this.loadingService.hide();
      
      if (error instanceof Error && error.message.includes('cancelled')) {
        await this.toastService.info('Selección de imagen cancelada');
      } else {
        await this.toastService.error('Error al seleccionar la imagen');
      }
      throw error;
    }
  }

  private async sendImageFile(chatId: string, senderId: string, file: File): Promise<void> {
    try {
      const fileName = `chat_${chatId}_${Date.now()}.jpg`;
      const filePath = `images/chats/${fileName}`;
      
      const imageUrl = await this.supabaseService.uploadImage(file, filePath);
      
      const message: Message = {
        senderId: senderId,
        type: 'image',
        content: imageUrl,
        timestamp: null,
        metadata: {
          name: file.name,
          size: file.size,
          mimeType: file.type
        }
      };

      await this.sendMessage(chatId, message);
      
      await this.loadingService.hide();
      
    } catch (error) {
      console.error('Error enviando imagen:', error);
      await this.loadingService.hide();
      await this.toastService.error('Error al enviar la imagen');
      throw error;
    }
  }

  private async dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }

  private getMessageTypeText(type: string): string {
    const typeTexts: Record<string, string> = {
      'image': '📷 Imagen',
      'audio': '🎵 Audio',
      'file': '📎 Archivo'
    };
    return typeTexts[type] || 'Mensaje';
  }

  async sendFile(chatId: string, senderId: string, file: File, fileType: 'file' | 'audio' = 'file'): Promise<void> {
    try {
      let folder = 'files';
      if (fileType === 'audio') {
        folder = 'audios';
      } else if (file.type.startsWith('image/')) {
        folder = 'images';
      }
      
      const fileExtension = file.name.split('.').pop() || '';
      const fileName = `chat_${chatId}_${Date.now()}.${fileExtension}`;
      const filePath = `${folder}/chats/${fileName}`;
      

      const fileUrl = await this.supabaseService.uploadImage(file, filePath);
      
      let messageType: 'file' | 'audio' | 'image' = 'file';
      if (fileType === 'audio' || file.type.startsWith('audio/')) {
        messageType = 'audio';
      } else if (file.type.startsWith('image/')) {
        messageType = 'image';
      }
      
      const message: Message = {
        senderId: senderId,
        type: messageType,
        content: fileUrl,
        timestamp: null,
        metadata: {
          name: file.name,
          size: file.size,
          mimeType: file.type
        }
      };

      await this.sendMessage(chatId, message);
      
    } catch (error) {
      console.error('Error enviando archivo:', error);
      throw error;
    }
  }

async uploadAudioFile(audioFile: File, filePath: string): Promise<string> {
  try {
    const audioUrl = await this.supabaseService.uploadImage(audioFile, filePath);
    return audioUrl;
  } catch (error) {
    console.error('Error subiendo audio:', error);
    throw new Error('Error al subir el archivo de audio');
  }
}
  
}