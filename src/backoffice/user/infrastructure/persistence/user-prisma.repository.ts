import { Injectable } from "@nestjs/common";
import { PrismaService } from "@testproject/database";
import { BackofficeUser, UserRole } from "../../domain/user.entity";
import { BackofficeUserRepository } from "../../domain/user.repository";

/**
 * Prisma implementation of the BackofficeUserRepository
 * 
 * Maps only the fields needed for the Backoffice context from the shared User table.
 */
@Injectable()
export class UserPrismaRepository implements BackofficeUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BackofficeUser[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return users.map((user) => this.toDomain(user));
  }

  async findById(id: string): Promise<BackofficeUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.toDomain(user);
  }

  async save(user: BackofficeUser): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.getId() },
      data: {
        isActive: user.getIsActive(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Maps Prisma User model to BackofficeUser domain entity
   */
  private toDomain(prismaUser: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): BackofficeUser {
    return new BackofficeUser({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role as UserRole,
      isActive: prismaUser.isActive,
      isEmailVerified: prismaUser.isEmailVerified,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
