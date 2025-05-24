import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { AuthValidator } from './auth.validator';
import { ValidationError } from '../../ exceptions/handlers/validation-error';


@Injectable({ providedIn: 'root' })
export class ValidationService {
    validateLoginForm(form: FormGroup): void {
        AuthValidator.validateLoginForm(form);
    }

    // validateProfileForm(form: FormGroup): void {
    //     ProfileValidator.validateProfileForm(form);
    // }

    validateForm(form: FormGroup, formType: 'login' | 'profile'): void {
        switch (formType) {
            case 'login':
                this.validateLoginForm(form);
                break;
            case 'profile':
                // this.validateProfileForm(form);
                // break;
            default:
                throw new Error(`Tipo de formulario no soportado: ${formType}`);
        }
    }

    validateRegisterForm(form: FormGroup): void {
        AuthValidator.validateRegisterForm(form);
    }

    validateEmail(emailControl: AbstractControl | null): void {
        const errors: Record<string, string[]> = {};
        
        if (emailControl?.hasError('required')) {
          errors['email'] = ['El correo electrónico es requerido'];
        } else if (emailControl?.hasError('email')) {
          errors['email'] = ['Ingresa un correo electrónico válido'];
        }
    
        if (Object.keys(errors).length > 0) {
          throw new ValidationError(errors);
        }
      }
}