import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController } from '@ionic/angular';
import { User } from 'src/app/core/models/user';
import { RegisterService } from 'src/app/domain/use-cases/register.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage {
  form: FormGroup;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private registerService: RegisterService,
    private toastController: ToastController
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });    
  }

  async onSubmit() {
    if (this.form.invalid) return;

    const { nombre, apellido, correo, telefono, password } = this.form.value;

    const user: User = {
      nombre,
      apellido,
      correo,
      telefono,
    };
    console.log('Enviando a Firebase:', { correo, password });


    try {
      await this.registerService.registerUser(user, password);

      const toast = await this.toastController.create({
        message: 'Usuario registrado exitosamente.',
        duration: 3000,
        color: 'success',
      });
      await toast.present();

      this.form.reset();
    } catch (error: any) {
      // console.log('Error en registro:', error);

      let message = 'Ocurrió un error en el registro.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'El correo ya está registrado.';
      }

      const toast = await this.toastController.create({
        message,
        duration: 2000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  
}
