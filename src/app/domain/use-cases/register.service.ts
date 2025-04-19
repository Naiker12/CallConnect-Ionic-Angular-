import { Injectable } from '@angular/core';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { FirebaseUserService } from 'src/app/data/sources/firebase-user.service';



@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(
    private authService: AuthService,
    private firebaseUserService: FirebaseUserService
  ) {}

  async registerUser(user: User, password: string): Promise<void> {
    try {
      const firebaseUser = await this.authService.register(user.correo, password);

      if (firebaseUser && firebaseUser.uid) {
        const userData: User = {
          uid: firebaseUser.uid,
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          telefono: user.telefono,
        };

        await this.firebaseUserService.saveUser(userData);
        console.log('Usuario registrado exitosamente');
      }
    } catch (error) {
      // console.error('Error al registrar usuario:', error);
      throw error;
    }
  }
}
