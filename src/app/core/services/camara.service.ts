import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {

  // Tomar una nueva foto con la cámara
  async captureImage(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      return image.webPath || null;
    } catch (error) {
      console.error('Error al capturar imagen:', error);
      return null;
    }
  }

  // Seleccionar imagen desde la galería
  async selectImageFromGallery(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      return image.webPath || null;
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      return null;
    }
  }
}