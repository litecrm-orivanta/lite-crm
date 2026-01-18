import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding super admin user...');

  // Create super-admin user (only one super-admin exists)
  // 💡 IMPORTANT: Set these via environment variables or modify below
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'changeme123';
  const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set');
  }

  const adminPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
  
  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { isSuperAdmin: true },
  });

  if (existingSuperAdmin && existingSuperAdmin.email !== SUPER_ADMIN_EMAIL) {
    console.log(`⚠️  Super admin already exists: ${existingSuperAdmin.email}`);
    console.log('   If you want to change super admin, please do so manually in the database.');
    return;
  }

  const adminUser = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      role: UserRole.ADMIN,
      isSuperAdmin: true,
      passwordHash: adminPassword,
      name: SUPER_ADMIN_NAME,
    },
    create: {
      email: SUPER_ADMIN_EMAIL,
      name: SUPER_ADMIN_NAME,
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isSuperAdmin: true,
      authProvider: 'LOCAL',
      workspace: {
        create: {
          name: 'Admin Workspace',
          type: 'SOLO',
          plan: 'BUSINESS',
          leadCount: 0,
        },
      },
    },
  });

  console.log('\n✅ Super admin user created/updated successfully!');
  console.log('\n📋 Super Admin Credentials:');
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Name: ${adminUser.name || SUPER_ADMIN_NAME}`);
  console.log(`   Password: ${SUPER_ADMIN_PASSWORD} (set via environment variable)`);
  console.log('\n💡 Tip: Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD in your .env file for production.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding super admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
