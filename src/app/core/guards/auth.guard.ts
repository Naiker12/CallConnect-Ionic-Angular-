import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { auth } from '../firebase/firebase-config';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = auth.currentUser;

    if (user && user.emailVerified) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;

  }
}
