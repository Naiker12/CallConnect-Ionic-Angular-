import { Injectable } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Location } from '@angular/common';
import { AppRoutes } from '../routing/routes/app.routes';
import { AuthRoutes } from '../routing/routes/auth.routes';
import { ProfileRoutes } from '../routing/routes/profile.routes';


@Injectable({ providedIn: 'root' })
export class NavigationService {
  constructor(private router: Router, private location: Location) {}

  // ----- Métodos específicos -----
  goToHome(): void {
    this.#navigate(AppRoutes.HOME);
  }

  goToProfile(): void {
    this.#navigate(ProfileRoutes.PROFILE);
  }

  goToLogin(replaceUrl = true): void {
    this.#navigate(AuthRoutes.LOGIN, {}, replaceUrl);
  }

  logoutAndRedirect(): void {
    this.goToLogin(true);
  }

  goBack(): void {
    this.location.back();
  }
  
  goToRegister(): void {
    this.#navigate(AuthRoutes.REGISTER);
  }

  goToForgotPassword(): void {
    this.#navigate(AuthRoutes.FORGOT_PASSWORD);
  }

  goToRecover(): void {
    this.#navigate(AuthRoutes.RECOVER);
  }

  goToContacts(): void {
    this.#navigate(AuthRoutes.CONTACTS);
  }

  #navigate(
    route: string, 
    extras: NavigationExtras = {}, 
    replaceUrl = false
  ): void {
    if (replaceUrl) {
      this.router.navigateByUrl(route, { replaceUrl, ...extras });
    } else if (this.router.url !== route) {
      this.router.navigate([route], extras);
    }
  }
}