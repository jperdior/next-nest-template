import { Injectable } from "@nestjs/common";
import { PrismaService } from "@testproject/database";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepositoryInterface } from "../../domain/repositories/user.repository.interface";

/** Prisma User record type */
type PrismaUser = {
  id: string;
  email: string;
  name: string;
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
