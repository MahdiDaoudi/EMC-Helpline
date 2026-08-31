const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const platforms = await prisma.platform.findMany({
    include: {
      _count: {
        select: { signalements: true, reportedItems: true }
      }
    }
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
