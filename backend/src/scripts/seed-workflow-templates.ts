import { PrismaClient } from '@prisma/client';
import { workflowTemplatesSeed } from '../workflow-templates/templates.seed';

const prisma = new PrismaClient();

async function run() {
  for (const template of workflowTemplatesSeed) {
    const existing = await prisma.workflowTemplate.findFirst({
      where: { name: template.name, category: template.category },
    });

    if (existing) {
      continue;
    }

    const created = await prisma.workflowTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        tags: template.tags,
        useCase: template.useCase,
        complexity: template.complexity,
        status: template.status,
        isFeatured: template.isFeatured || false,
      },
    });

    await prisma.workflowTemplateVersion.create({
      data: {
        templateId: created.id,
        version: 1,
        nodes: template.nodes,
        edges: template.edges,
      },
    });
  }
}

run()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Workflow templates seeded');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
