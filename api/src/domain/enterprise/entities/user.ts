import { Optional } from "@/core/@types/optional";
import { Entity } from "@/core/entities/entity";
import { UniqueEntityID } from "@/core/entities/unique-entity-id";

export interface UserProps {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<UserProps> {
  get name() {
    return this.props.name;
  }

  set name(name: string) {
    this.props.name = name;
    this.touch();
  }

  get email() {
    return this.props.email;
  }

  set email(email: string) {
    this.props.email = email;
    this.touch();
  }

  get password() {
    return this.props.password;
  }

  set password(password: string) {
    this.props.password = password;
    this.touch();
  }

  get role() {
    return this.props.role ?? "user";
  }

  set role(role: "admin" | "user") {
    this.props.role = role;
    this.touch();
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<UserProps, "createdAt" | "updatedAt">,
    id?: UniqueEntityID
  ) {
    const user = new User(
      {
        ...props,
        role: props.role ?? "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      id
    );

    return user;
  }
}
