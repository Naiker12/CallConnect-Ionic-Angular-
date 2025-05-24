import { Injectable } from '@angular/core';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { ChatService } from 'src/app/core/services/Chat.Service';

@Injectable({
  providedIn: 'root'
})
export class ChatActions {

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private toastService: CustomToastService,
    private chatService: ChatService
  ) {}

  /**
   * Muestra opciones de archivo adjunto
   */
  async showAttachmentOptions(): Promise<'camera' | 'gallery' | 'file' | null> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Enviar archivo',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera-outline',
          handler: () => {
            this.actionSheetCtrl.dismiss('camera');
            return false;
          }
        },
        {
          text: 'Elegir imagen',
          icon: 'images-outline',
          handler: () => {
            this.actionSheetCtrl.dismiss('gallery');
            return false;
          }
        },
        {
          text: 'Subir archivo',
          icon: 'document-outline',
          handler: () => {
            this.actionSheetCtrl.dismiss('file');
            return false;
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
    const result = await actionSheet.onDidDismiss();
    return result.data || null;
  }

  /**
   * Muestra opciones del chat
   */
  async showChatOptions(): Promise<string | null> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Opciones del chat',
      buttons: [
        {
          text: 'Ver perfil',
          icon: 'person-outline',
          handler: () => {
            this.actionSheetCtrl.dismiss('profile');
            return false;
          }
        },
        {
          text: 'Buscar en chat',
          icon: 'search-outline',
          handler: () => {
            this.actionSheetCtrl.dismiss('search');
            return false;
          }
        },
        {
          text: 'Silenciar',
          icon: 'notifications-off-outline',
          handler: () => {
            this.actionSheetCtrl.dismiss('mute');
            return false;
          }
        },
        {
          text: 'Limpiar chat',
          icon: 'trash-outline',
          handler: () => {
            this.actionSheetCtrl.dismiss('clear');
            return false;
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
    const result = await actionSheet.onDidDismiss();
    return result.data || null;
  }

  /**
   * Maneja las acciones del chat
   */
  async handleChatAction(action: string): Promise<void> {
    switch (action) {
      case 'profile':
        this.toastService.info('Función de perfil no implementada');
        break;
      case 'search':
        this.toastService.info('Función de búsqueda no implementada');
        break;
      case 'mute':
        this.toastService.info('Chat silenciado');
        break;
      case 'clear':
        this.toastService.info('Función de limpiar chat no implementada');
        break;
    }
  }

  /**
   * Maneja el envío de archivos multimedia
   */
  async handleFileAction(
    action: 'camera' | 'gallery' | 'file',
    chatId: string,
    userId: string
  ): Promise<void> {
    const loading = await this.showFileLoading(this.getLoadingMessage(action));
    
    try {
      switch (action) {
        case 'camera':
          await this.chatService.sendImageFromCamera(chatId, userId);
          this.toastService.success('Foto enviada');
          break;
        case 'gallery':
          await this.chatService.sendImageFromGallery(chatId, userId);
          this.toastService.success('Imagen enviada');
          break;
        case 'file':
          break;
      }
    } catch (error) {
      console.error('Error enviando archivo:', error);
      this.toastService.error('Error al enviar el archivo');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Muestra loading para archivos
   */
  async showFileLoading(message: string = 'Procesando archivo...'): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      message,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  /**
   * Obtiene el mensaje de loading según la acción
   */
  private getLoadingMessage(action: string): string {
    switch (action) {
      case 'camera': return 'Tomando foto...';
      case 'gallery': return 'Seleccionando imagen...';
      case 'file': return 'Subiendo archivo...';
      default: return 'Procesando archivo...';
    }
  }

  /**
   * Maneja funciones de llamada
   */
  handleCallAction(type: 'call' | 'video'): void {
    const message = type === 'call' ? 'llamada' : 'videollamada';
    this.toastService.info(`Función de ${message} no implementada`);
  }
}