import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, Platform } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Toast } from '@capacitor/toast';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
  standalone : false
})
export class AddContactModalComponent {
  form: FormGroup;
  isSubmitting = false;
  userPhotoPreview: string | undefined;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private firebaseContactService: FirebaseContactService,
    private authService: AuthService,
    private platform: Platform
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      foto: ['']
    });
  }

  async changePhoto() {
    try {
      const permission = await this.checkCameraPermissions();
      if (!permission) {
        await this.showError('Se necesitan permisos de cámara');
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelPhoto: 'Seleccionar de galería',
        promptLabelPicture: 'Tomar foto'
      });
      
      if (image.dataUrl) {
        this.userPhotoPreview = image.dataUrl;
        this.form.patchValue({ foto: image.dataUrl });
        
        // Opcional: Guardar la imagen localmente
        if (this.platform.is('capacitor')) {
          await this.saveImageToDevice(image.dataUrl);
        }
      }
    } catch (error) {
      console.log('Usuario canceló la selección de foto:', error);
    }
  }

  private async checkCameraPermissions(): Promise<boolean> {
    if (this.platform.is('capacitor')) {
      try {
        const status = await Camera.checkPermissions();
        return status.camera === 'granted' && status.photos === 'granted';
      } catch {
        return false;
      }
    }
    return true; // Para web
  }

  private async saveImageToDevice(dataUrl: string): Promise<void> {
    try {
      const fileName = `contact_photo_${new Date().getTime()}.jpeg`;
      await Filesystem.writeFile({
        path: fileName,
        data: dataUrl,
        directory: Directory.Data
      });
    } catch (error) {
      console.error('Error guardando imagen:', error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    try {
      const { nombre, telefono, foto } = this.form.value;
      const userId = this.authService.getUserId();

      if (!userId) {
        await this.showError('Error de autenticación');
        return;
      }

      const contact = await this.firebaseContactService.searchUserByPhone(telefono);
      if (!contact) {
        await this.showError('No se encontró un usuario con ese número');
        return;
      }

      const contactData = {
        ...contact,
        nombre: nombre.trim(),
        telefono: telefono,
        foto: foto || contact.foto || 'assets/icon/user-default.png',
        fechaCreacion: new Date().toISOString()
      };

      await this.firebaseContactService.addContact(userId, contactData);
      await this.showSuccess('Contacto agregado exitosamente');
      this.modalCtrl.dismiss({ success: true, contact: contactData });
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      await this.showError('Error al agregar contacto. Intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  private async showSuccess(message: string): Promise<void> {
    await Toast.show({
      text: message,
      duration: 'long',
      position: 'bottom'
    });
  }
  
  private async showError(message: string): Promise<void> {
    await Toast.show({
      text: message,
      duration: 'long',
      position: 'bottom',
      // color: 'danger'
    });
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }
}