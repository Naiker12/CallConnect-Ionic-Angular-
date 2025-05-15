import { AppError } from './app-error';

export class ValidationError extends AppError {
    constructor(
        public readonly fieldErrors: Record<string, string[]>,
        message: string = 'Por favor corrige los errores en el formulario'
    ) {
        super(message, 'VALIDATION_ERROR');
    }

    getCombinedMessages(): string {
        return Object.values(this.fieldErrors)
            .join('\n');
    }

    getFirstError(): string | null {
        const firstKey = Object.keys(this.fieldErrors)[0];
        return firstKey ? this.fieldErrors[firstKey][0] : null;
    }
}