import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  await prisma.item.deleteMany();
  console.log('Cleared existing items');

  // Create sample items
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: 'Sample Item 1',
        description: 'This is the first sample item',
      },
    }),
    prisma.item.create({
      data: {
        name: 'Sample Item 2',
        description: 'This is the second sample item',
      },
    }),
    prisma.item.create({
      data: {
        name: 'Sample Item 3',
        description: 'This is the third sample item',
      },
    }),
  ]);

  console.log(`Created ${items.length} items`);
  console.log('Database seeding completed!');
}

main()
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
