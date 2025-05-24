import { Injectable } from '@angular/core';
import { Auth, User as FirebaseUser, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        this.currentUserSubject.next(userData);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  async getUserData(uid: string): Promise<User | null> {
    try {
      const userDocRef = doc(this.firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        return { uid, ...userDoc.data() as User };
      } else {
        const firebaseUser = this.auth.currentUser;
        if (firebaseUser) {
          const newUser: User = {
            uid: firebaseUser.uid,
            nombre: firebaseUser.displayName?.split(' ')[0] || '',
            apellido: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
            correo: firebaseUser.email || '',
            telefono: firebaseUser.phoneNumber || ''
          };
          await setDoc(userDocRef, newUser);
          return newUser;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async updateUserData(userData: Partial<User>): Promise<boolean> {
    try {
      const currentUser = this.auth.currentUser;
      if (!currentUser || !userData) return false;

      const userDocRef = doc(this.firestore, 'users', currentUser.uid);
      await updateDoc(userDocRef, userData);

      if (userData.nombre || userData.apellido) {
        const currentUserData = this.getCurrentUser();
        const displayName = `${userData.nombre || currentUserData?.nombre || ''} ${userData.apellido || currentUserData?.apellido || ''}`.trim();
        await updateProfile(currentUser, { displayName });
      }
      
      const updatedUser = await this.getUserData(currentUser.uid);
      this.currentUserSubject.next(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  }
}