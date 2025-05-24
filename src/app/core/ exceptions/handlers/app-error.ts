export class AppError extends Error {
    constructor(
        public readonly userMessage: string,
        public readonly code: string = 'GENERIC_ERROR',
        public readonly originalError?: any
    ) {
        super(userMessage);
    }
}