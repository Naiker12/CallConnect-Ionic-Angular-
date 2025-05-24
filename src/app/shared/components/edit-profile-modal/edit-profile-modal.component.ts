import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { User } from 'src/app/core/models/user';
import { CustomToastService } from 'src/app/core/services/custom-toast.service';
import { UserService } from 'src/app/core/services/User.service';


@Component({
  selector: 'app-edit-profile-modal',
  templateUrl: './edit-profile-modal.component.html',
  styleUrls: ['./edit-profile-modal.component.scss'],
  standalone: false
})
export class EditProfileModalComponent implements OnInit {
  @Input() userData: User | null = null;
  profileForm: FormGroup;
  isSubmitting = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private toastService: CustomToastService,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      telefono: ['', Validators.pattern(/^\+?[0-9]{10,15}$/)]
    });
  }

  ngOnInit() {
    if (this.userData) {
      this.profileForm.patchValue({
        nombre: this.userData.nombre || '',
        apellido: this.userData.apellido || '',
        telefono: this.userData.telefono || ''
      });
    } else {
      const currentUser = this.userService.getCurrentUser();
      if (currentUser) {
        this.userData = currentUser;
        this.profileForm.patchValue({
          nombre: currentUser.nombre || '',
          apellido: currentUser.apellido || '',
          telefono: currentUser.telefono || ''
        });
      }
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async save() {
    if (this.profileForm.invalid) {
      this.toastService.warning('Por favor, completa los campos correctamente.');
      return;
    }

    this.isSubmitting = true;
    const { nombre, apellido, telefono } = this.profileForm.value;

    try {
      const updated = await this.userService.updateUserData({
        nombre,
        apellido,
        telefono
      });

      if (updated) {
        this.toastService.success('Perfil actualizado correctamente');
        this.modalCtrl.dismiss({ updated: true });
      } else {
        throw new Error('No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      this.toastService.error('Error al actualizar el perfil. Intenta nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }
}