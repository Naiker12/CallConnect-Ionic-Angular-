import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirebaseContactService } from 'src/app/data/sources/firebase-contact.service';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact-modal.component.html',
  styleUrls: ['./add-contact-modal.component.scss'],
  standalone: false
})
export class AddContactModalComponent {
  form: FormGroup;
  isSubmitting = false;

  readonly MESSAGES = {
    CONTACT_NOT_FOUND: 'Contacto no encontrado.',
    CONTACT_ADDED: 'Contacto agregado exitosamente.',
    ERROR: 'Ocurrió un error al agregar el contacto.',
    PHONE_REQUIRED: 'El número de teléfono es obligatorio.',
    PHONE_INVALID: 'Por favor, ingresa un número de teléfono válido.',
  };

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private firebaseContactService: FirebaseContactService,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    this.form = this.fb.group({
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  /**
   * Envía el formulario y busca/agrega el contacto si es válido
   */
  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;

    const telefono = this.form.value.telefono;
    const userId = this.authService.getUserId();

    if (!userId) {
      await this.showToast(this.MESSAGES.ERROR, 'danger');
      this.isSubmitting = false;
      return;
    }

    try {
      const contact = await this.firebaseContactService.searchUserByPhone(telefono);

      if (!contact) {
        await this.showToast(this.MESSAGES.CONTACT_NOT_FOUND, 'danger');
        return;
      }

      await this.firebaseContactService.addContact(userId, contact);
      await this.showToast(this.MESSAGES.CONTACT_ADDED, 'success');
      this.form.reset();
      this.modalCtrl.dismiss(true); 
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      await this.showToast(this.MESSAGES.ERROR, 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Muestra un mensaje en pantalla (toast)
   * @param  mensaje a mostrar
   * @param color del toast
   */
  private async showToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  /**
   * Getter para acceder al control del teléfono desde el HTML
   */
  get telefonoControl() {
    return this.form.get('telefono');
  }

  dismiss() {
    this.modalCtrl.dismiss(); 
  }

}
