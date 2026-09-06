export const MIN_PASSWORD_LENGTH = 10;

export const PASSWORD_REQUIREMENT = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;

export function getPasswordValidationError(password: string) {
  return password.length < MIN_PASSWORD_LENGTH ? PASSWORD_REQUIREMENT : null;
}
