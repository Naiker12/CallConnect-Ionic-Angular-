import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { User } from 'src/app/core/models/user';


@Injectable({
  providedIn: 'root'
})
export class FirebaseUserService {
  constructor(private firestore: Firestore) {}

  async saveUser(user: User): Promise<void> {
    const userRef = doc(this.firestore, `users/${user.uid}`);
    await setDoc(userRef, {
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      telefono: user.telefono
    });
  }
}
