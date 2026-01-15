/**
 * Invalid Credentials Exception
 * Domain exception for authentication failures
 * 
 * This exception is thrown when:
 * - User credentials are invalid
 * - User account is not active
 * - Email is not verified
 */
export class InvalidCredentialsException extends Error {
  constructor(message: string = "Invalid credentials") {
    super(message);
    this.name = "InvalidCredentialsException";
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidCredentialsException);
    }
  }
}
