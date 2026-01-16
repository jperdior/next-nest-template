import { Injectable } from "@nestjs/common";
import { PrismaService } from "@testproject/database";
import { UserFacingAppUser } from "../../domain/entities/user.entity";
import { UserRole } from "../../domain/value-objects/role.value-object";
import { UserFacingAppUserRepository } from "../../domain/user.repository";

/**
 * Prisma implementation of the UserFacingAppUserRepository
 * 
 * Maps all auth-related fields from the shared User table.
 */
@Injectable()
export class UserPrismaRepository implements UserFacingAppUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserFacingAppUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;
    return this.toDomain(user);
  }

  async findById(id: string): Promise<UserFacingAppUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return this.toDomain(user);
  }

  async create(user: UserFacingAppUser): Promise<UserFacingAppUser> {
    const data = user.toPrimitives();
    
    const created = await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        isEmailVerified: data.isEmailVerified,
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpiry: data.emailVerificationExpiry,
        passwordResetToken: data.passwordResetToken,
        passwordResetExpiry: data.passwordResetExpiry,
        isActive: data.isActive,
        lastLoginAt: data.lastLoginAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });

    return this.toDomain(created);
  }

  async update(user: UserFacingAppUser): Promise<void> {
    const data = user.toPrimitives();
    
    await this.prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role,
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        isEmailVerified: data.isEmailVerified,
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpiry: data.emailVerificationExpiry,
        passwordResetToken: data.passwordResetToken,
        passwordResetExpiry: data.passwordResetExpiry,
        isActive: data.isActive,
        lastLoginAt: data.lastLoginAt,
        updatedAt: new Date(),
      },
    });
  }

  private toDomain(prismaUser: {
    id: string;
    email: string;
    name: string;
    passwordHash: string | null;
    role: string;
    googleId: string | null;
    avatarUrl: string | null;
    isEmailVerified: boolean;
    emailVerificationToken: string | null;
    emailVerificationExpiry: Date | null;
    passwordResetToken: string | null;
    passwordResetExpiry: Date | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserFacingAppUser {
    return new UserFacingAppUser({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      passwordHash: prismaUser.passwordHash,
      role: prismaUser.role as UserRole,
      googleId: prismaUser.googleId,
      avatarUrl: prismaUser.avatarUrl,
      isEmailVerified: prismaUser.isEmailVerified,
      emailVerificationToken: prismaUser.emailVerificationToken,
      emailVerificationExpiry: prismaUser.emailVerificationExpiry,
      passwordResetToken: prismaUser.passwordResetToken,
      passwordResetExpiry: prismaUser.passwordResetExpiry,
      isActive: prismaUser.isActive,
      lastLoginAt: prismaUser.lastLoginAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
