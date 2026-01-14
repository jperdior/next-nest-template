import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { ItemEntity } from '../../domain/entities/item.entity';
import { ItemRepositoryInterface } from '../../domain/repositories/item.repository.interface';

@Injectable()
export class ItemPrismaRepository implements ItemRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(item: ItemEntity): Promise<ItemEntity> {
    const data = item.toPlainObject();
    const created = await this.prisma.item.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      },
    });
    return new ItemEntity(created);
  }

  async findById(id: string): Promise<ItemEntity | null> {
    const item = await this.prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return null;
    }

    return new ItemEntity(item);
  }

  async findAll(): Promise<ItemEntity[]> {
    const items = await this.prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => new ItemEntity(item));
  }

  async update(item: ItemEntity): Promise<ItemEntity> {
    const data = item.toPlainObject();
    const updated = await this.prisma.item.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        updatedAt: data.updatedAt,
      },
    });

    return new ItemEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.item.delete({
      where: { id },
    });
  }
}
