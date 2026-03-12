require('dotenv/config');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('../../prisma/generated');

async function testDBConnection() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })});

  try {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    await prisma.$disconnect().catch(() => {});
    return { result: true, message: `Connected. Tables: ${tables.map(table => table.tablename).join(", ")}` };
  }
  catch (err) {
    await prisma.$disconnect().catch(() => {});
    return { result: false, message: err instanceof Error ? err.message : String(err),};
  }
}
async function printConnectionResult() {
  const result = await testDBConnection();
  console.log(result);
}

// Return result of testDB Connection if running tsx directly
if (require.main === module) {
  printConnectionResult();
}
else {
  module.exports = { testDBConnection };
}
