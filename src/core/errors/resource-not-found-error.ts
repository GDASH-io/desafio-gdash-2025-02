export class ResourceNotFoundError extends Error {
  constructor() {
    super(`Resource Not found`);
  }
}
