

export abstract class AuthRepository {
  abstract sendPasswordResetEmail(email: string): Promise<void>;
  
}
