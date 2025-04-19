import { User } from 'src/app/core/models/user';

export interface UserRepository {
  save(user: User): Promise<void>;
}
