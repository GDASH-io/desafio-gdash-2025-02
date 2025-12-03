export class WrongCredentialsError extends Error {
  constructor() {
    super(`credentials are not valid`);
  }
}
