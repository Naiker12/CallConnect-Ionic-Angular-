import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import Swal from 'sweetalert2';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
  standalone: false
})
export class AddContactModalComponent {
  form: FormGroup;
  isSubmitting = false;
  userPhotoPreview: string | undefined;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private firebaseContactService: FirebaseContactService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      foto: ['']
    });
  }

  async changePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      
      if (image.dataUrl) {
        this.userPhotoPreview = image.dataUrl;
        this.form.patchValue({ foto: image.dataUrl });
      }
    } catch (error) {
      console.log('Usuario canceló la selección de foto');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    const { nombre, telefono, foto } = this.form.value;
    const userId = this.authService.getUserId();

    if (!userId) {
      this.showErrorAlert('Error de autenticación');
      this.isSubmitting = false;
      return;
    }

    try {
      const contact = await this.firebaseContactService.searchUserByPhone(telefono);

      if (!contact) {
        this.showErrorAlert('Contacto no encontrado');
        return;
      }

      // Agregar nombre y foto al contacto
      const contactWithDetails = {
        ...contact,
        nombre: nombre,
        foto: foto || contact.foto || 'assets/icon/icon_1200.webp'
      };

      await this.firebaseContactService.addContact(userId, contactWithDetails);
      this.showSuccessAlert('Contacto agregado exitosamente');
      this.form.reset();
      this.modalCtrl.dismiss(true);
    } catch (error) {
      this.showErrorAlert('Error al agregar contacto');
      console.error(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private showSuccessAlert(message: string): void {
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: message,
      timer: 2000,
      showConfirmButton: false,
      position: 'center',
      backdrop: 'rgba(0,0,0,0.4)',
      background: 'var(--ion-color-light)',
      color: 'var(--ion-color-dark)',
      customClass: {
        popup: 'animated tada',
        title: 'swal2-title-custom',
        icon: 'swal2-icon-custom'
      }
    });
  }
  
  private showErrorAlert(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      timer: 2000,
      showConfirmButton: false,
      position: 'center',
      backdrop: 'rgba(0,0,0,0.4)',
      background: 'var(--ion-color-light)',
      color: 'var(--ion-color-dark)',
      iconColor: 'var(--ion-color-danger)'
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}