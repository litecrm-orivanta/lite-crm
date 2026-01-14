import { PrismaClient, PlanType, SubscriptionStatus, PaymentStatus, InvoiceStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin test data...');

  // 1. Create super-admin user (only one super-admin exists)
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      role: UserRole.ADMIN,
      isSuperAdmin: true, // Only this user is super-admin
      passwordHash: adminPassword,
    },
    create: {
      email: 'admin@test.com',
      name: 'Super Admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      isSuperAdmin: true, // Only this user is super-admin
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

  console.log('✅ Admin user created:', adminUser.email);

  // 2. Create test workspaces with different plans
  const workspacePlans = [
    { plan: PlanType.FREE, name: 'Free Workspace' },
    { plan: PlanType.STARTER, name: 'Starter Workspace' },
    { plan: PlanType.PROFESSIONAL, name: 'Professional Workspace' },
    { plan: PlanType.BUSINESS, name: 'Business Workspace' },
  ];

  const workspaces = [];
  for (const wp of workspacePlans) {
    const userPassword = await bcrypt.hash('test123', 10);
    const workspace = await prisma.workspace.create({
      data: {
        name: wp.name,
        type: 'SOLO',
        plan: wp.plan,
        leadCount: wp.plan === PlanType.FREE ? 4 : 0, // 4 leads for FREE to test 80% warning
        users: {
          create: {
            email: `${wp.plan.toLowerCase()}@test.com`,
            name: `${wp.plan} User`,
            passwordHash: userPassword,
            role: UserRole.ADMIN,
            authProvider: 'LOCAL',
          },
        },
      },
    });
    workspaces.push(workspace);
    console.log(`✅ Created workspace: ${wp.name} (${wp.plan})`);
  }

  // 3. Create subscriptions for each workspace
  const subscriptions = [];
  for (const workspace of workspaces) {
    const planAmounts: Record<PlanType, number> = {
      [PlanType.FREE]: 0,
      [PlanType.STARTER]: 1499,
      [PlanType.PROFESSIONAL]: 2999,
      [PlanType.BUSINESS]: 7999,
      [PlanType.ENTERPRISE]: 0,
    };

    const subscription = await prisma.subscription.upsert({
      where: { workspaceId: workspace.id },
      update: {},
      create: {
        workspaceId: workspace.id,
        planType: workspace.plan as PlanType,
        status: workspace.plan === PlanType.FREE ? SubscriptionStatus.TRIAL : SubscriptionStatus.ACTIVE,
        amount: planAmounts[workspace.plan as PlanType] || 0,
        currency: 'USD',
        billingCycle: 'monthly',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isManual: workspace.plan === PlanType.BUSINESS, // Business plan is manual
        adminNotes: workspace.plan === PlanType.BUSINESS ? 'Manually assigned by admin' : null,
      },
    });
    subscriptions.push(subscription);
    console.log(`✅ Created subscription for ${workspace.name}`);
  }

  // 4. Create test payments
  const paymentData = [
    { subscription: subscriptions[1], amount: 1499, status: PaymentStatus.COMPLETED, daysAgo: 5 },
    { subscription: subscriptions[2], amount: 2999, status: PaymentStatus.COMPLETED, daysAgo: 10 },
    { subscription: subscriptions[3], amount: 7999, status: PaymentStatus.COMPLETED, daysAgo: 15 },
    { subscription: subscriptions[1], amount: 1499, status: PaymentStatus.PENDING, daysAgo: 0 },
    { subscription: subscriptions[2], amount: 2999, status: PaymentStatus.FAILED, daysAgo: 2 },
  ];

  for (const pd of paymentData) {
    const paidAt = pd.status === PaymentStatus.COMPLETED 
      ? new Date(Date.now() - pd.daysAgo * 24 * 60 * 60 * 1000)
      : null;

    await prisma.payment.create({
      data: {
        subscriptionId: pd.subscription.id,
        amount: pd.amount,
        currency: 'USD',
        status: pd.status,
        paymentMethod: 'stripe',
        paymentGateway: 'stripe',
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paidAt,
        metadata: {
          test: true,
        },
      },
    });
  }
  console.log('✅ Created test payments');

  // 5. Create test invoices
  for (let i = 0; i < 3; i++) {
    const subscription = subscriptions[i + 1]; // Skip FREE plan
    if (!subscription) continue;

    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        invoiceNumber: `INV-${Date.now()}-${i}`,
        amount: subscription.amount,
        currency: 'USD',
        status: i === 0 ? InvoiceStatus.PAID : i === 1 ? InvoiceStatus.SENT : InvoiceStatus.DRAFT,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidAt: i === 0 ? new Date() : null,
      },
    });
    console.log(`✅ Created invoice: ${invoice.invoiceNumber}`);
  }

  // 6. Create some test leads for FREE workspace (to test usage limits)
  const freeWorkspace = workspaces.find(w => w.plan === PlanType.FREE);
  if (freeWorkspace) {
    const freeUser = await prisma.user.findFirst({
      where: { workspaceId: freeWorkspace.id },
    });

    if (freeUser) {
      // Already has 4 leads (set above), so we're at 80% - perfect for testing warnings
      console.log(`✅ FREE workspace has ${freeWorkspace.leadCount} leads (80% of limit)`);
    }
  }

  console.log('\n🎉 Test data seeding complete!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin: admin@test.com / admin123');
  console.log('   Free: free@test.com / test123');
  console.log('   Starter: starter@test.com / test123');
  console.log('   Professional: professional@test.com / test123');
  console.log('   Business: business@test.com / test123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
