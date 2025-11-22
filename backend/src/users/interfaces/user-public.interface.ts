export interface UserPublic {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}
