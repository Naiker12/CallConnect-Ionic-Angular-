import { Injectable } from '@angular/core';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Capacitor } from '@capacitor/core';
import { CustomToastService } from '../custom-toast.service';
import { LoadingService } from '../loading.service';


@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private isRecording = false;
  private recordingStartTime: number = 0;

  constructor(
    private toastService: CustomToastService,
    private loadingService: LoadingService
  ) {}

  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await VoiceRecorder.requestAudioRecordingPermission();
      return permission.value;
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      this.toastService.error('Error al solicitar permisos de audio');
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (!Capacitor.isNativePlatform()) {
        this.toastService.warning('La grabación de audio solo está disponible en dispositivos móviles');
        return false;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        this.toastService.error('Se requieren permisos de micrófono para grabar audio');
        return false;
      }

      const canRecord = await VoiceRecorder.canDeviceVoiceRecord();
      if (!canRecord.value) {
        this.toastService.error('El dispositivo no puede grabar audio');
        return false;
      }

      await VoiceRecorder.startRecording();
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      
      return true;
    } catch (error) {
      console.error('Error starting recording:', error);
      this.toastService.error('Error al iniciar la grabación');
      return false;
    }
  }

  async stopRecording(): Promise<{ success: boolean; audioFile?: File; duration?: number }> {
    try {
      if (!this.isRecording) {
        return { success: false };
      }

      await this.loadingService.show('Procesando audio...');
      
      const result = await VoiceRecorder.stopRecording();
      this.isRecording = false;
      
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      
      if (result.value && result.value.recordDataBase64) {
        const audioBlob = this.base64ToBlob(result.value.recordDataBase64, 'audio/aac');
        const audioFile = new File([audioBlob], `audio_${Date.now()}.aac`, { type: 'audio/aac' });
        
        await this.loadingService.hide();
        return { success: true, audioFile, duration };
      }
      
      await this.loadingService.hide();
      return { success: false };
    } catch (error) {
      console.error('Error stopping recording:', error);
      await this.loadingService.hide();
      this.toastService.error('Error al detener la grabación');
      return { success: false };
    }
  }

  async cancelRecording(): Promise<void> {
    try {
      if (this.isRecording) {
        await VoiceRecorder.stopRecording();
        this.isRecording = false;
      }
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }

  getRecordingStatus(): { isRecording: boolean; duration: number } {
    const duration = this.isRecording ? Math.floor((Date.now() - this.recordingStartTime) / 1000) : 0;
    return { isRecording: this.isRecording, duration };
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}