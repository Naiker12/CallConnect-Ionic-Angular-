import { ErrorHandler, Injectable } from '@angular/core';
import { ValidationError } from './validation-error';
import { AuthError } from './auth-error';
import { CustomToastService } from '../../services/custom-toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    constructor(private toastService: CustomToastService) {}

    handleError(error: unknown): void {
        console.error('Error capturado:', error);

        if (error instanceof ValidationError) {
            this.toastService.error(error.getFirstError() || error.message);
        } else if (error instanceof AuthError) {
            this.handleAuthError(error);
        } else if (error instanceof Error) {
            this.toastService.error(error.message);
        } else {
            this.toastService.error('Ocurrió un error inesperado');
        }
    }

    private handleAuthError(error: AuthError): void {
        switch (error.errorType) {
            case 'USER_NOT_FOUND':
                this.toastService.error('Usuario no encontrado');
                break;
            case 'WRONG_PASSWORD':
                this.toastService.error('Contraseña incorrecta');
                break;
            case 'UNVERIFIED_EMAIL':
                this.toastService.warning('Por favor verifica tu correo electrónico');
                break;
            default:
                this.toastService.error('Error de autenticación');
        }
    }
}