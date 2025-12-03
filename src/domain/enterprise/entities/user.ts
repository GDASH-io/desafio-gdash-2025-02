import { Entity } from '@/core/entities/entity';
import type { UniqueEntityID } from '@/core/entities/unique-entity-id';
export interface userProps {
  name: string;
  userName: string;
  email: string;
  password: string;
}
export class User extends Entity<userProps> {
  get name() {
    return this.props.name;
  }

  get userName() {
    return this.props.userName;
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }

  set name(name: string) {
    this.props.name = name;
  }

  set userName(userName: string) {
    this.props.userName = userName;
  }

  set email(email: string) {
    this.props.email = email;
  }

  set password(password: string) {
    this.props.password = password;
  }

  static create(props: userProps, id?: UniqueEntityID) {
    const user = new User(props, id);
    return user;
  }
}
