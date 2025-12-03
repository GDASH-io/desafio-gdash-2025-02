export class CredentialAlreadyExistError extends Error {
  constructor(credential: string) {
    super(`Credential ${credential} cannot be used`);
  }
}
