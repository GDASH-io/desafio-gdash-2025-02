import { UseCaseError } from "./use-case-error";

export class ValidationError extends Error implements UseCaseError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}
