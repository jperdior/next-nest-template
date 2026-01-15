import { Injectable } from "@nestjs/common";
import { PrismaService } from "@testproject/database";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepositoryInterface } from "../../domain/repositories/user.repository.interface";
import { UserRole } from "../../domain/value-objects/role.value-object";
import { UserRole as PrismaUserRole } from "@testproject/database/generated";

/** Prisma User record type matching the updated schema */
type PrismaUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  role: PrismaUserRole;
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
};

@Injectable()
export class UserPrismaRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convert Prisma user to domain entity
   */
  private toDomain(prismaUser: PrismaUser): UserEntity {
    return new UserEntity({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      passwordHash: prismaUser.passwordHash,
      role: prismaUser.role as unknown as UserRole, // Prisma and domain enums have same values
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

  async create(user: UserEntity): Promise<UserEntity> {
    const data = user.toPlainObject();
    const created = await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role as unknown as PrismaUserRole, // Convert domain enum to Prisma enum
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

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { googleId },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByEmailVerificationToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByPasswordResetToken(token: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findFirst({
      where: { passwordResetToken: token },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return users.map((user: PrismaUser) => this.toDomain(user));
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const data = user.toPlainObject();
    const updated = await this.prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role as unknown as PrismaUserRole, // Convert domain enum to Prisma enum
        googleId: data.googleId,
        avatarUrl: data.avatarUrl,
        isEmailVerified: data.isEmailVerified,
        emailVerificationToken: data.emailVerificationToken,
        emailVerificationExpiry: data.emailVerificationExpiry,
        passwordResetToken: data.passwordResetToken,
        passwordResetExpiry: data.passwordResetExpiry,
        isActive: data.isActive,
        lastLoginAt: data.lastLoginAt,
        updatedAt: data.updatedAt,
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
