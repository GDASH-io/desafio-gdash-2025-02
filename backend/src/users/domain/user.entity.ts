export class UserEntity {
  constructor(
    public readonly email: string,
    public readonly password?: string,
    public readonly id?: string,
    public readonly createdAt?: Date,
  ) {}
}
