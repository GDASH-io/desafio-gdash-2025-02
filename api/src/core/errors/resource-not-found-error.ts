import { UseCaseError } from "./use-case-error";

export class ResourceNotFoundError extends Error implements UseCaseError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`);
    this.name = "ResourceNotFoundError";
  }
}
