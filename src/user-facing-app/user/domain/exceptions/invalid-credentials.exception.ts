/**
 * Invalid Credentials Exception
 * Domain exception for authentication failures
 */
export class InvalidCredentialsException extends Error {
  constructor(message: string = "Invalid credentials") {
    super(message);
    this.name = "InvalidCredentialsException";
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidCredentialsException);
    }
  }
}
