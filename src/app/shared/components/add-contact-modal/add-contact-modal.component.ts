import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, Platform, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/core/services/navigation.service';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
  standalone: false
})
export class AddContactModalComponent {
  form!: FormGroup;
  isSubmitting = false;
  userPhotoPreview: string | undefined;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private firebaseContactService: FirebaseContactService,
    private authService: AuthService,
    private platform: Platform,
    private toastService: CustomToastService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private navService: NavigationService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      foto: ['']
    });
  }

  async changePhoto(): Promise<void> {
    try {
      if (!await this.checkCameraPermissions()) {
        this.toastService.warning('Se requieren permisos de cámara y galería');
        return;
      }

      const image = await this.getPhotoFromUser();
      if (image?.dataUrl) {
        this.handleNewPhoto(image.dataUrl);
      }
    } catch (error) {
      console.log('Selección de foto cancelada:', error);
    }
  }

  private async getPhotoFromUser() {
    return await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      promptLabelPhoto: 'Seleccionar de galería',
      promptLabelPicture: 'Tomar foto'
    });
  }

  private async handleNewPhoto(dataUrl: string): Promise<void> {
    this.userPhotoPreview = dataUrl;
    this.form.patchValue({ foto: dataUrl });

    if (this.platform.is('capacitor')) {
      await this.saveImageToDevice(dataUrl);
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
    return true; 
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
      this.toastService.error('Error al guardar la imagen en el dispositivo');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting) {
      if (this.form.invalid) {
        this.showFormErrors();
      }
      return;
    }

    this.isSubmitting = true;
    const loading = await this.showLoading();

    try {
      const result = await this.processContactAddition();
      if (result) {
        this.modalCtrl.dismiss(result);
      }
    } catch (error) {
      this.handleSubmissionError(error);
    } finally {
      this.isSubmitting = false;
      await loading.dismiss();
    }
  }

  private async processContactAddition(): Promise<any> {
    const { nombre, telefono, foto } = this.form.value;
    const userId = this.authService.getUserId();

    if (!userId) {
      this.toastService.error('Error de autenticación. Por favor inicia sesión nuevamente');
      return null;
    }

    const contact = await this.firebaseContactService.searchUserByPhone(telefono);
    if (!contact) {
      this.toastService.error('No se encontró un usuario con ese número');
      return null;
    }

    return this.createContactData(userId, contact, nombre, telefono, foto);
  }

  private async createContactData(userId: string, contact: any, nombre: string, telefono: string, foto: string): Promise<any> {
    const contactData = {
      ...contact,
      nombre: nombre.trim(),
      telefono: telefono,
      foto: foto || contact.foto || 'assets/icon/user-default.png',
      fechaCreacion: new Date().toISOString()
    };

    await this.firebaseContactService.addContact(userId, contactData);
    this.toastService.success('Contacto agregado exitosamente');
    return { success: true, contact: contactData };
  }

  private showFormErrors(): void {
    if (this.form.get('nombre')?.errors?.['required']) {
      this.toastService.warning('El nombre es requerido');
    } else if (this.form.get('nombre')?.errors?.['minlength']) {
      this.toastService.warning('El nombre debe tener al menos 2 caracteres');
    } else if (this.form.get('telefono')?.errors?.['required']) {
      this.toastService.warning('El teléfono es requerido');
    } else if (this.form.get('telefono')?.errors?.['pattern']) {
      this.toastService.warning('El teléfono debe tener 10 dígitos');
    }
  }

  private async showLoading(): Promise<HTMLIonLoadingElement> {
    const loading = await this.loadingCtrl.create({
      message: 'Agregando contacto...',
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  private handleSubmissionError(error: any): void {
    console.error('Error al agregar contacto:', error);
    const errorMessage = error?.message || 'Error al agregar contacto. Intenta nuevamente.';
    this.toastService.error(errorMessage);
  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  goBack() {
    this.navService.goToHome();
  }

}