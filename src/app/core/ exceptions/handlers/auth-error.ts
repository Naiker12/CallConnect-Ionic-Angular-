import { AppError } from "./app-error";

export class AuthError extends AppError {
    constructor(
        public readonly errorType: 
            'USER_NOT_FOUND' | 
            'WRONG_PASSWORD' | 
            'UNVERIFIED_EMAIL' |
            'EMAIL_ALREADY_IN_USE' |
            'WEAK_PASSWORD' |
            'INVALID_EMAIL',
        message: string
    ) {
        super(message, 'AUTH_ERROR');
    }
}