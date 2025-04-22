import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
  standalone : false
})
export class AddContactModalComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private firebaseContactService: FirebaseContactService,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    const telefono = this.form.value.telefono;
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

      await this.firebaseContactService.addContact(userId, contact);
      this.showSuccessAlert('Contacto agregado exitosamente');
      this.form.reset();
      this.modalCtrl.dismiss(true);
    } catch (error) {
      this.showErrorAlert('Error al agregar contacto');
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