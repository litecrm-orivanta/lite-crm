import { WorkflowTemplateComplexity, WorkflowTemplateStatus } from '@prisma/client';

export const workflowTemplatesSeed = [
  {
    name: 'Lead Capture → Assign → Notify',
    description: 'Auto-assign new leads and notify the owner by email.',
    category: 'Lead Management',
    tags: ['lead', 'assignment', 'email'],
    useCase: 'Instant lead assignment with owner notification',
    complexity: WorkflowTemplateComplexity.SIMPLE,
    status: WorkflowTemplateStatus.PUBLISHED,
    isFeatured: true,
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Lead Created', triggerEvent: 'LEAD_CREATED' },
      },
      {
        id: 'email-1',
        type: 'email',
        position: { x: 250, y: 0 },
        data: {
          label: 'Notify Owner',
          config: {
            to: '{{lead.owner.email}}',
            subject: 'New lead assigned',
            body: 'A new lead {{lead.name}} was created.',
          },
        },
      },
    ],
    edges: [{ id: 'edge-1', source: 'trigger-1', target: 'email-1' }],
  },
  {
    name: 'Stale Lead Follow-Up',
    description: 'Wait 3 days and send a follow-up message if lead is still open.',
    category: 'Engagement',
    tags: ['follow-up', 'delay', 'email'],
    useCase: 'Re-engage leads after inactivity',
    complexity: WorkflowTemplateComplexity.INTERMEDIATE,
    status: WorkflowTemplateStatus.PUBLISHED,
    nodes: [
      {
        id: 'trigger-2',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Lead Created', triggerEvent: 'LEAD_CREATED' },
      },
      {
        id: 'delay-2',
        type: 'delay',
        position: { x: 220, y: 0 },
        data: { label: 'Wait 3 Days', config: { duration: '3d' } },
      },
      {
        id: 'email-2',
        type: 'email',
        position: { x: 460, y: 0 },
        data: {
          label: 'Follow-up Email',
          config: {
            to: '{{lead.email}}',
            subject: 'Checking in',
            body: 'Hi {{lead.name}}, just checking in on your interest.',
          },
        },
      },
    ],
    edges: [
      { id: 'edge-2', source: 'trigger-2', target: 'delay-2' },
      { id: 'edge-3', source: 'delay-2', target: 'email-2' },
    ],
  },
  {
    name: 'Stage Change → Slack Alert',
    description: 'Notify the sales team in Slack when a lead moves stage.',
    category: 'Alerts',
    tags: ['slack', 'stage-change'],
    useCase: 'Keep the team informed on lead progress',
    complexity: WorkflowTemplateComplexity.SIMPLE,
    status: WorkflowTemplateStatus.PUBLISHED,
    nodes: [
      {
        id: 'trigger-3',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Lead Stage Changed', triggerEvent: 'LEAD_STAGE_CHANGED' },
      },
      {
        id: 'slack-3',
        type: 'slack',
        position: { x: 260, y: 0 },
        data: {
          label: 'Send Slack',
          config: {
            channel: '#sales',
            message: 'Lead {{lead.name}} moved to {{lead.stage}}.',
          },
        },
      },
    ],
    edges: [{ id: 'edge-4', source: 'trigger-3', target: 'slack-3' }],
  },
  {
    name: 'Win/Loss Feedback Loop',
    description: 'Send a feedback email when a lead is marked Won or Lost.',
    category: 'Post-Sales',
    tags: ['email', 'feedback'],
    useCase: 'Collect feedback after closing',
    complexity: WorkflowTemplateComplexity.INTERMEDIATE,
    status: WorkflowTemplateStatus.PUBLISHED,
    nodes: [
      {
        id: 'trigger-4',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Lead Stage Changed', triggerEvent: 'LEAD_STAGE_CHANGED' },
      },
      {
        id: 'condition-4',
        type: 'condition',
        position: { x: 230, y: 0 },
        data: { label: 'Won or Lost', config: { field: 'lead.stage', operator: 'IN', value: 'WON,LOST' } },
      },
      {
        id: 'email-4',
        type: 'email',
        position: { x: 480, y: 0 },
        data: {
          label: 'Feedback Email',
          config: {
            to: '{{lead.email}}',
            subject: 'How was your experience?',
            body: 'We would love your feedback on our process.',
          },
        },
      },
    ],
    edges: [
      { id: 'edge-5', source: 'trigger-4', target: 'condition-4' },
      { id: 'edge-6', source: 'condition-4', target: 'email-4' },
    ],
  },
  {
    name: 'Multi-Channel Outreach',
    description: 'Send email + WhatsApp + SMS to a new lead.',
    category: 'Outreach',
    tags: ['email', 'whatsapp', 'sms'],
    useCase: 'Reach leads through multiple channels',
    complexity: WorkflowTemplateComplexity.ADVANCED,
    status: WorkflowTemplateStatus.PUBLISHED,
    isFeatured: true,
    nodes: [
      {
        id: 'trigger-5',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Lead Created', triggerEvent: 'LEAD_CREATED' },
      },
      {
        id: 'email-5',
        type: 'email',
        position: { x: 220, y: -120 },
        data: {
          label: 'Welcome Email',
          config: { to: '{{lead.email}}', subject: 'Welcome', body: 'Thanks for your interest!' },
        },
      },
      {
        id: 'whatsapp-5',
        type: 'whatsapp',
        position: { x: 220, y: 0 },
        data: {
          label: 'WhatsApp',
          config: { to: '{{lead.phone}}', message: 'Hi {{lead.name}}, thanks for reaching out!' },
        },
      },
      {
        id: 'sms-5',
        type: 'sms',
        position: { x: 220, y: 120 },
        data: {
          label: 'SMS',
          config: { to: '{{lead.phone}}', message: 'We will get back to you soon.' },
        },
      },
    ],
    edges: [
      { id: 'edge-7', source: 'trigger-5', target: 'email-5' },
      { id: 'edge-8', source: 'trigger-5', target: 'whatsapp-5' },
      { id: 'edge-9', source: 'trigger-5', target: 'sms-5' },
    ],
  },
  {
    name: 'High-Value Lead Escalation',
    description: 'Escalate high-value leads with a Slack alert and task.',
    category: 'Lead Management',
    tags: ['condition', 'slack', 'task'],
    useCase: 'Ensure high-value leads get attention',
    complexity: WorkflowTemplateComplexity.ADVANCED,
    status: WorkflowTemplateStatus.PUBLISHED,
    nodes: [
      {
        id: 'trigger-6',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Lead Created', triggerEvent: 'LEAD_CREATED' },
      },
      {
        id: 'condition-6',
        type: 'condition',
        position: { x: 220, y: 0 },
        data: { label: 'High Value', config: { field: 'lead.value', operator: '>=', value: '10000' } },
      },
      {
        id: 'slack-6',
        type: 'slack',
        position: { x: 470, y: 0 },
        data: {
          label: 'Escalate',
          config: { channel: '#sales-leads', message: 'High value lead: {{lead.name}}' },
        },
      },
    ],
    edges: [
      { id: 'edge-10', source: 'trigger-6', target: 'condition-6' },
      { id: 'edge-11', source: 'condition-6', target: 'slack-6' },
    ],
  },
  {
    name: 'Re-Engagement Campaign',
    description: 'Re-engage leads after 14 days with email and task creation.',
    category: 'Engagement',
    tags: ['delay', 'email', 'task'],
    useCase: 'Revive cold leads',
    complexity: WorkflowTemplateComplexity.INTERMEDIATE,
    status: WorkflowTemplateStatus.PUBLISHED,
    nodes: [
      {
        id: 'trigger-7',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Lead Created', triggerEvent: 'LEAD_CREATED' },
      },
      {
        id: 'delay-7',
        type: 'delay',
        position: { x: 220, y: 0 },
        data: { label: 'Wait 14 Days', config: { duration: '14d' } },
      },
      {
        id: 'email-7',
        type: 'email',
        position: { x: 460, y: 0 },
        data: {
          label: 'Re-engage Email',
          config: {
            to: '{{lead.email}}',
            subject: 'Still interested?',
            body: 'We would love to help if you are still exploring options.',
          },
        },
      },
    ],
    edges: [
      { id: 'edge-12', source: 'trigger-7', target: 'delay-7' },
      { id: 'edge-13', source: 'delay-7', target: 'email-7' },
    ],
  },
  {
    name: 'Appointment Reminder',
    description: 'Send reminders before scheduled calls.',
    category: 'Scheduling',
    tags: ['sms', 'email', 'delay'],
    useCase: 'Reduce no-shows with reminders',
    complexity: WorkflowTemplateComplexity.INTERMEDIATE,
    status: WorkflowTemplateStatus.PUBLISHED,
    nodes: [
      {
        id: 'trigger-8',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Task Created', triggerEvent: 'TASK_CREATED' },
      },
      {
        id: 'delay-8',
        type: 'delay',
        position: { x: 220, y: 0 },
        data: { label: 'Wait 1 Day', config: { duration: '1d' } },
      },
      {
        id: 'sms-8',
        type: 'sms',
        position: { x: 460, y: 0 },
        data: {
          label: 'SMS Reminder',
          config: { to: '{{lead.phone}}', message: 'Reminder: upcoming appointment tomorrow.' },
        },
      },
    ],
    edges: [
      { id: 'edge-14', source: 'trigger-8', target: 'delay-8' },
      { id: 'edge-15', source: 'delay-8', target: 'sms-8' },
    ],
  },
  {
    name: 'Subscription Renewal Reminder',
    description: 'Notify workspace owners before subscription renewal.',
    category: 'Billing',
    tags: ['renewal', 'email'],
    useCase: 'Reduce churn via renewal reminders',
    complexity: WorkflowTemplateComplexity.SIMPLE,
    status: WorkflowTemplateStatus.PUBLISHED,
    nodes: [
      {
        id: 'trigger-9',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Task Created', triggerEvent: 'TASK_CREATED' },
      },
      {
        id: 'email-9',
        type: 'email',
        position: { x: 220, y: 0 },
        data: {
          label: 'Renewal Email',
          config: {
            to: '{{workspace.owner.email}}',
            subject: 'Subscription renewal reminder',
            body: 'Your subscription is due for renewal soon.',
          },
        },
      },
    ],
    edges: [{ id: 'edge-16', source: 'trigger-9', target: 'email-9' }],
  },
];
