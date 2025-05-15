import { FormGroup } from '@angular/forms';
import { ValidationError } from '../../ exceptions/handlers/validation-error';


export class AuthValidator {
    static validateLoginForm(form: FormGroup): void {
        const errors: Record<string, string[]> = {};
        const emailControl = form.get('email');
        const passwordControl = form.get('password');

        // Validación de email
        if (emailControl?.hasError('required')) {
            errors['email'] = ['El correo electrónico es requerido'];
        } else if (emailControl?.hasError('email')) {
            errors['email'] = ['Ingresa un correo electrónico válido'];
        }

        // Validación de contraseña
        if (passwordControl?.hasError('required')) {
            errors['password'] = ['La contraseña es requerida'];
        } else if (passwordControl?.value && passwordControl.value.length < 6) {
            errors['password'] = ['La contraseña debe tener al menos 6 caracteres'];
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }
    }
    static validateRegisterForm(form: FormGroup): void {
        const errors: Record<string, string[]> = {};
        const nameControl = form.get('nombre');
        const lastNameControl = form.get('apellido');
        const emailControl = form.get('correo');
        const phoneControl = form.get('telefono');
        const passwordControl = form.get('password');

        // Validación de nombre
        if (nameControl?.hasError('required')) {
            errors['nombre'] = ['El nombre es requerido'];
        } else if (nameControl?.hasError('pattern')) {
            errors['nombre'] = ['Solo se permiten letras y espacios'];
        }

        // Validación de apellido
        if (lastNameControl?.hasError('required')) {
            errors['apellido'] = ['El apellido es requerido'];
        } else if (lastNameControl?.hasError('pattern')) {
            errors['apellido'] = ['Solo se permiten letras y espacios'];
        }

        // Validación de email
        if (emailControl?.hasError('required')) {
            errors['correo'] = ['El correo electrónico es requerido'];
        } else if (emailControl?.hasError('email')) {
            errors['correo'] = ['Ingresa un correo electrónico válido'];
        }

        // Validación de teléfono
        if (phoneControl?.hasError('required')) {
            errors['telefono'] = ['El teléfono es requerido'];
        } else if (phoneControl?.hasError('pattern')) {
            errors['telefono'] = ['Debe tener exactamente 10 dígitos'];
        }

        // Validación de contraseña
        if (passwordControl?.hasError('required')) {
            errors['password'] = ['La contraseña es requerida'];
        } else if (passwordControl?.value && passwordControl.value.length < 6) {
            errors['password'] = ['La contraseña debe tener al menos 6 caracteres'];
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationError(errors);
        }
    }
}
