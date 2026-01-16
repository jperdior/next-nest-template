import { z } from "zod";
import { randomBytes, createHash, timingSafeEqual } from "crypto";
import { AggregateRoot } from "@testproject/shared";
import { Email } from "../value-objects/email.value-object";
import { Role, UserRole } from "../value-objects/role.value-object";
import { Password } from "../value-objects/password.value-object";

/**
 * Zod schema for UserFacingAppUser entity validation
 */
const UserEntitySchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  passwordHash: z.string().nullable().optional(),
  role: z.nativeEnum(UserRole),
  
  // Google SSO
  googleId: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  
  // Email verification
  isEmailVerified: z.boolean(),
  emailVerificationToken: z.string().nullable().optional(),
  emailVerificationExpiry: z.date().nullable().optional(),
  
  // Password reset
  passwordResetToken: z.string().nullable().optional(),
  passwordResetExpiry: z.date().nullable().optional(),
  
  // Account state
  isActive: z.boolean(),
  lastLoginAt: z.date().nullable().optional(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type UserEntityProps = z.infer<typeof UserEntitySchema>;

/**
 * UserFacingAppUser Entity
 * 
 * Represents a user from the UserFacingApp bounded context perspective.
 * This entity contains all auth-related fields and logic:
 * - Registration and login
 * - Password management
 * - Email verification
 * - Google SSO
 */
export class UserFacingAppUser extends AggregateRoot {
  private readonly id: string;
  private email: Email;
  private name: string;
  private passwordHash: string | null | undefined;
  private role: Role;
  
  // Google SSO
  private googleId: string | null | undefined;
  private avatarUrl: string | null | undefined;
  
  // Email verification
  private isEmailVerified: boolean;
  private emailVerificationToken: string | null | undefined;
  private emailVerificationExpiry: Date | null | undefined;
  
  // Password reset
  private passwordResetToken: string | null | undefined;
  private passwordResetExpiry: Date | null | undefined;
  
  // Account state
  private isActive: boolean;
  private lastLoginAt: Date | null | undefined;
  
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserEntityProps) {
    super();
    const validated = UserEntitySchema.parse(props);
    this.id = validated.id;
    this.email = Email.create(validated.email);
    this.name = validated.name;
    this.passwordHash = validated.passwordHash;
    this.role = Role.fromEnum(validated.role);
    
    this.googleId = validated.googleId;
    this.avatarUrl = validated.avatarUrl;
    
    this.isEmailVerified = validated.isEmailVerified;
    this.emailVerificationToken = validated.emailVerificationToken;
    this.emailVerificationExpiry = validated.emailVerificationExpiry;
    
    this.passwordResetToken = validated.passwordResetToken;
    this.passwordResetExpiry = validated.passwordResetExpiry;
    
    this.isActive = validated.isActive;
    this.lastLoginAt = validated.lastLoginAt;
    
    this.createdAt = validated.createdAt;
    this.updatedAt = validated.updatedAt;
  }

  // Getters
  getId(): string { return this.id; }
  getEmail(): Email { return this.email; }
  getName(): string { return this.name; }
  getPasswordHash(): string | null | undefined { return this.passwordHash; }
  getRole(): Role { return this.role; }
  getGoogleId(): string | null | undefined { return this.googleId; }
  getAvatarUrl(): string | null | undefined { return this.avatarUrl; }
  getIsEmailVerified(): boolean { return this.isEmailVerified; }
  getIsActive(): boolean { return this.isActive; }
  getLastLoginAt(): Date | null | undefined { return this.lastLoginAt; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Authentication
  canLogin(): boolean {
    return this.isActive && (this.isEmailVerified || !!this.googleId);
  }

  recordLogin(): void {
    this.lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    if (!this.passwordHash) return false;
    const password = Password.fromHash(this.passwordHash);
    return await password.verify(plainPassword);
  }

  async setPassword(plainPassword: string): Promise<void> {
    const password = await Password.create(plainPassword);
    this.passwordHash = password.getHashedValue();
    this.updatedAt = new Date();
  }

  hasPassword(): boolean {
    return !!this.passwordHash;
  }

  usesGoogleSSO(): boolean {
    return !!this.googleId;
  }

  // Email Verification
  initiateEmailVerification(): string {
    const token = this.generateToken();
    this.emailVerificationToken = token;
    this.emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    this.updatedAt = new Date();
    return token;
  }

  verifyEmail(token: string): boolean {
    if (!this.emailVerificationToken || !this.emailVerificationExpiry) {
      return false;
    }

    const storedHash = createHash('sha256').update(this.emailVerificationToken, 'utf8').digest();
    const providedHash = createHash('sha256').update(token, 'utf8').digest();
    
    if (storedHash.length !== providedHash.length || !timingSafeEqual(storedHash, providedHash)) {
      return false;
    }

    if (new Date() > this.emailVerificationExpiry) {
      return false;
    }

    this.isEmailVerified = true;
    this.emailVerificationToken = null;
    this.emailVerificationExpiry = null;
    this.updatedAt = new Date();
    return true;
  }

  markEmailAsVerified(): void {
    this.isEmailVerified = true;
    this.emailVerificationToken = null;
    this.emailVerificationExpiry = null;
    this.updatedAt = new Date();
  }

  // Password Reset
  initiatePasswordReset(): string {
    const token = this.generateToken();
    this.passwordResetToken = token;
    this.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000);
    this.updatedAt = new Date();
    return token;
  }

  async resetPassword(token: string, newPlainPassword: string): Promise<boolean> {
    if (!this.passwordResetToken || !this.passwordResetExpiry) {
      return false;
    }

    const storedHash = createHash('sha256').update(this.passwordResetToken, 'utf8').digest();
    const providedHash = createHash('sha256').update(token, 'utf8').digest();
    
    if (storedHash.length !== providedHash.length || !timingSafeEqual(storedHash, providedHash)) {
      return false;
    }

    if (new Date() > this.passwordResetExpiry) {
      return false;
    }

    await this.setPassword(newPlainPassword);
    this.passwordResetToken = null;
    this.passwordResetExpiry = null;
    this.updatedAt = new Date();
    return true;
  }

  // Account State
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Google SSO
  linkGoogleAccount(googleId: string, avatarUrl?: string): void {
    this.googleId = googleId;
    if (avatarUrl) this.avatarUrl = avatarUrl;
    this.isEmailVerified = true;
    this.updatedAt = new Date();
  }

  unlinkGoogleAccount(): void {
    if (!this.hasPassword()) {
      throw new Error("Cannot unlink Google account without a password set");
    }
    this.googleId = null;
    this.updatedAt = new Date();
  }

  // Utility
  private generateToken(): string {
    return randomBytes(32).toString("hex");
  }

  toPrimitives(): UserEntityProps {
    return {
      id: this.id,
      email: this.email.getValue(),
      name: this.name,
      passwordHash: this.passwordHash,
      role: this.role.getValue(),
      googleId: this.googleId,
      avatarUrl: this.avatarUrl,
      isEmailVerified: this.isEmailVerified,
      emailVerificationToken: this.emailVerificationToken,
      emailVerificationExpiry: this.emailVerificationExpiry,
      passwordResetToken: this.passwordResetToken,
      passwordResetExpiry: this.passwordResetExpiry,
      isActive: this.isActive,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
