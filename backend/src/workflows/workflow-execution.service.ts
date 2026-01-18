import { Injectable, Logger } from '@nestjs/common';
import { isIP } from 'net';
import { PrismaService } from '../prisma/prisma.service';
import {
  WorkflowNodeType,
  WorkflowTriggerEvent,
  WorkflowExecutionStatus,
  IntegrationType,
} from '@prisma/client';
import { NotificationService } from '../notifications/notification.service';
import { ConfigService } from '@nestjs/config';
import { IntegrationsService } from '../integrations/integrations.service';
import { EmailIntegrationService } from '../integrations/email-integration.service';
import { AuditService } from '../audit/audit.service';

export interface WorkflowContext {
  event: WorkflowTriggerEvent;
  workspaceId: string;
  data: Record<string, any>;
  variables: Record<string, any>;
}

@Injectable()
export class WorkflowExecutionService {
  private readonly logger = new Logger(WorkflowExecutionService.name);

  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
    private configService: ConfigService,
    private integrationsService: IntegrationsService,
    private emailIntegrationService: EmailIntegrationService,
    private audit: AuditService,
  ) {}

  /**
   * Execute a workflow by ID
   */
  async executeWorkflow(
    workflowId: string,
    context: WorkflowContext,
  ): Promise<string> {
    this.logger.log(`Executing workflow ${workflowId} for event ${context.event}`);
    
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        edges: {
          include: {
            sourceNode: {
              select: { id: true, nodeId: true, type: true },
            },
            targetNode: {
              select: { id: true, nodeId: true, type: true },
            },
          },
        },
      },
    });

    if (!workflow) {
      this.logger.error(`Workflow ${workflowId} not found`);
      throw new Error('Workflow not found');
    }

    if (workflow.workspaceId !== context.workspaceId) {
      this.logger.error(`Workflow ${workflowId} workspace mismatch`);
      throw new Error('Workflow access denied');
    }

    if (!workflow.active) {
      this.logger.warn(`Workflow ${workflowId} is inactive, skipping execution`);
      throw new Error('Workflow is inactive');
    }

    this.logger.log(`Workflow ${workflowId} has ${workflow.nodes?.length || 0} nodes`);

    // Create execution record
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: WorkflowExecutionStatus.RUNNING,
        input: context.data,
        startedAt: new Date(),
      },
    });

    this.logger.log(`📝 [EXECUTION] Created execution record: ${execution.id} for workflow: ${workflowId}`);
    await this.audit.log({
      action: 'workflow.execution.start',
      resource: 'workflow_execution',
      resourceId: execution.id,
      workspaceId: workflow.workspaceId,
      metadata: { workflowId, event: context.event },
    });

    try {
      // Find trigger node (handle both enum and string types)
      const triggerNode = workflow.nodes.find(
        (n: any) => {
          const nodeType = typeof n.type === 'string' ? n.type : String(n.type);
          return nodeType === 'TRIGGER' || nodeType === WorkflowNodeType.TRIGGER;
        },
      );

      if (!triggerNode) {
        this.logger.error(`❌ [EXECUTION] No trigger node found in workflow ${workflowId}`);
        throw new Error('No trigger node found in workflow');
      }

      this.logger.log(`🎯 [EXECUTION] Found trigger node: ${triggerNode.nodeId} with event: ${triggerNode.triggerEvent}`);

      // Check if trigger event matches
      if (triggerNode.triggerEvent !== context.event) {
        this.logger.warn(`⚠️  [EXECUTION] Trigger event mismatch. Expected: ${context.event}, Got: ${triggerNode.triggerEvent}`);
        throw new Error('Trigger event does not match');
      }

      this.logger.log(`🚀 [EXECUTION] Starting workflow execution from trigger node...`);

      // Execute workflow starting from trigger
      const result = await this.executeNode(
        triggerNode,
        workflow,
        context,
        execution.id,
      );

      this.logger.log(`✅ [EXECUTION] Workflow execution completed successfully. Execution ID: ${execution.id}`);

      // Update execution as successful
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.SUCCESS,
          output: result,
          completedAt: new Date(),
        },
      });

      return execution.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ [EXECUTION] Workflow execution failed. Execution ID: ${execution.id} | Error: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
      
      // Update execution as failed
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: WorkflowExecutionStatus.FAILED,
          error: errorMessage,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    node: any,
    workflow: any,
    context: WorkflowContext,
    executionId: string,
  ): Promise<any> {
    // Handle both enum and string types
    const nodeType = typeof node.type === 'string' ? node.type : String(node.type);
    this.logger.log(`  🔹 [NODE] Executing node: ${node.nodeId || node.id} (${nodeType})`);

    let result: any = null;
    
    switch (nodeType.toUpperCase()) {
      case 'TRIGGER':
        // Trigger node just passes through the context data
        result = context.data;
        break;

      case 'HTTP_REQUEST':
        result = await this.executeHttpRequest(node, context);
        break;

      case 'EMAIL':
        result = await this.executeEmail(node, context);
        break;

      case 'DELAY':
        result = await this.executeDelay(node, context);
        break;

      case 'CONDITION':
        result = await this.executeCondition(node, context);
        break;

      case 'SET_VARIABLE':
        result = await this.executeSetVariable(node, context);
        break;

      case 'WEBHOOK':
        result = await this.executeWebhook(node, context);
        break;

      case 'CHATGPT':
        result = await this.executeChatGPT(node, context);
        break;

      case 'WHATSAPP':
        result = await this.executeWhatsApp(node, context);
        break;

      case 'TELEGRAM':
        result = await this.executeTelegram(node, context);
        break;

      case 'SLACK':
        result = await this.executeSlack(node, context);
        break;

      case 'SMS':
        result = await this.executeSMS(node, context);
        break;

      case 'LOG':
        result = await this.executeLog(node, context);
        break;

      case 'TRANSFORM':
        result = await this.executeTransform(node, context);
        break;

      case 'FILTER':
        result = await this.executeFilter(node, context);
        break;

      case 'LOOP':
        result = await this.executeLoop(node, workflow, context, executionId);
        break;

      case 'MERGE':
        result = await this.executeMerge(node, context);
        break;

      case 'SPLIT':
        result = await this.executeSplit(node, context);
        break;

      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }

    // Update context variables if result is set
    if (result) {
      context.variables[`${node.nodeId}_output`] = result;
    }

    // Find next nodes to execute
    const outgoingEdges = workflow.edges.filter(
      (e: any) => e.sourceNodeId === node.id,
    );

    this.logger.log(`  🔗 [NODE] Node ${node.nodeId || node.id} has ${outgoingEdges.length} outgoing edge(s)`);

    // Execute next nodes in parallel (or sequentially based on node type)
    const nextResults: any[] = [];
    for (const edge of outgoingEdges) {
      const nextNode = workflow.nodes.find(
        (n: any) => n.id === edge.targetNodeId,
      );

      if (nextNode) {
        // For condition nodes, check if we should follow this path
        const currentNodeType = typeof node.type === 'string' ? node.type : String(node.type);
        if (currentNodeType.toUpperCase() === 'CONDITION') {
          const shouldFollow = this.shouldFollowConditionPath(
            edge,
            result,
            node,
          );
          if (!shouldFollow) {
            this.logger.log(`  ⏭️  [NODE] Skipping edge (condition false): ${edge.edgeId || edge.id}`);
            continue;
          }
          this.logger.log(`  ✅ [NODE] Following edge (condition true): ${edge.edgeId || edge.id}`);
        }

        const nextResult = await this.executeNode(
          nextNode,
          workflow,
          context,
          executionId,
        );
        nextResults.push(nextResult);
      } else {
        this.logger.warn(`  ⚠️  [NODE] Target node not found for edge: ${edge.edgeId || edge.id}`);
      }
    }

    this.logger.log(`  ✅ [NODE] Node ${node.nodeId || node.id} completed`);
    return result;
  }

  /**
   * Execute HTTP Request node
   */
  private async executeHttpRequest(
    node: any,
    context: WorkflowContext,
  ): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('HTTP Request node missing configuration');
    }

    const url = this.interpolateString(config.url || '', context);
    const method = config.method || 'GET';
    const headers = this.interpolateObject(config.headers || {}, context);
    const body = config.body ? this.interpolateString(config.body, context) : undefined;

    try {
      this.validateHttpTarget(url);
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(JSON.parse(body)) : undefined,
      });

      const responseData = await response.json().catch(() => response.text());

      return {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      };
    } catch (error) {
      throw new Error(
        `HTTP Request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private validateHttpTarget(url: string) {
    if (!url) {
      throw new Error('HTTP Request node missing URL');
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error('Invalid HTTP Request URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Only HTTP/HTTPS requests are allowed');
    }

    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'localhost' || hostname.endsWith('.local')) {
      throw new Error('Localhost requests are not allowed');
    }

    if (this.isPrivateIp(hostname)) {
      throw new Error('Private network targets are not allowed');
    }

    const allowlist = process.env.WORKFLOW_HTTP_ALLOWLIST;
    if (allowlist) {
      const allowed = allowlist
        .split(',')
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
      if (!allowed.some((entry) => hostname === entry || hostname.endsWith(`.${entry}`))) {
        throw new Error('Target host is not in the allowlist');
      }
    }
  }

  private isPrivateIp(hostname: string) {
    const ipType = isIP(hostname);
    if (ipType === 0) return false;

    if (ipType === 6) {
      const normalized = hostname.toLowerCase();
      return (
        normalized === '::1' ||
        normalized.startsWith('fc') ||
        normalized.startsWith('fd') ||
        normalized.startsWith('fe80')
      );
    }

    const parts = hostname.split('.').map((part) => parseInt(part, 10));
    if (parts.length !== 4 || parts.some(Number.isNaN)) return true;

    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 0) return true;

    return false;
  }

  /**
   * Execute Email node
   */
  private async executeEmail(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Email node missing configuration');
    }

    const to = this.interpolateString(config.to || '', context);
    const subject = this.interpolateString(config.subject || '', context);
    const body = this.interpolateString(config.body || '', context);

    if (!to || !subject) {
      throw new Error('Email node missing required fields (to, subject)');
    }

    try {
      // Use EmailIntegrationService which handles both Lite CRM and custom SMTP
      await this.emailIntegrationService.sendEmail(context.workspaceId, to, subject, body);
      return { success: true, to, subject };
    } catch (error) {
      throw new Error(
        `Email sending failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Execute Delay node
   */
  private async executeDelay(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    const delayMs = parseInt(config.delayMs || '1000', 10);

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return { delayed: delayMs };
  }

  /**
   * Execute Condition node
   */
  private async executeCondition(
    node: any,
    context: WorkflowContext,
  ): Promise<boolean> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Condition node missing configuration');
    }

    const leftValue = this.interpolateValue(config.leftValue || '', context);
    const operator = config.operator || '==';
    const rightValue = this.interpolateValue(config.rightValue || '', context);

    let result = false;

    switch (operator) {
      case '==':
        result = leftValue == rightValue;
        break;
      case '!=':
        result = leftValue != rightValue;
        break;
      case '>':
        result = leftValue > rightValue;
        break;
      case '<':
        result = leftValue < rightValue;
        break;
      case '>=':
        result = leftValue >= rightValue;
        break;
      case '<=':
        result = leftValue <= rightValue;
        break;
      case 'contains':
        result = String(leftValue).includes(String(rightValue));
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    return result;
  }

  /**
   * Execute Set Variable node
   */
  private async executeSetVariable(
    node: any,
    context: WorkflowContext,
  ): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Set Variable node missing configuration');
    }

    const variableName = config.variableName || '';
    const variableValue = this.interpolateValue(config.variableValue || '', context);

    context.variables[variableName] = variableValue;

    return { [variableName]: variableValue };
  }

  /**
   * Execute Webhook node (outgoing webhook)
   */
  private async executeWebhook(
    node: any,
    context: WorkflowContext,
  ): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Webhook node missing configuration');
    }

    const url = this.interpolateString(config.url || '', context);
    const method = config.method || 'POST';
    const body = config.body ? this.interpolateObject(config.body, context) : context.data;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json().catch(() => response.text());

      return {
        status: response.status,
        data: responseData,
      };
    } catch (error) {
      throw new Error(
        `Webhook failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Check if we should follow a condition path
   */
  private shouldFollowConditionPath(
    edge: any,
    conditionResult: boolean,
    conditionNode: any,
  ): boolean {
    // If edge has a label like "true" or "false", check it
    const edgeLabel = edge.edgeId?.toLowerCase() || '';
    if (edgeLabel.includes('true') && conditionResult) {
      return true;
    }
    if (edgeLabel.includes('false') && !conditionResult) {
      return true;
    }

    // Default: follow first edge if condition is true
    return conditionResult;
  }

  /**
   * Interpolate string with context variables
   */
  private interpolateString(template: string, context: WorkflowContext): string {
    let result = template;

    // Replace {{variable}} patterns
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      
      // Check in data first
      if (context.data[trimmedKey] !== undefined) {
        return String(context.data[trimmedKey]);
      }

      // Check in variables
      if (context.variables[trimmedKey] !== undefined) {
        return String(context.variables[trimmedKey]);
      }

      // Check nested paths like data.lead.name
      const parts = trimmedKey.split('.');
      let value: any = context.data;
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      if (value !== undefined) {
        return String(value);
      }

      return match; // Return original if not found
    });

    return result;
  }

  /**
   * Interpolate object values
   */
  private interpolateObject(obj: any, context: WorkflowContext): any {
    if (typeof obj === 'string') {
      return this.interpolateString(obj, context);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.interpolateObject(item, context));
    }
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, context);
      }
      return result;
    }
    return obj;
  }

  /**
   * Interpolate value (can be string or number)
   */
  private interpolateValue(value: any, context: WorkflowContext): any {
    if (typeof value === 'string') {
      const interpolated = this.interpolateString(value, context);
      // Try to parse as number
      const num = Number(interpolated);
      if (!isNaN(num) && interpolated.trim() !== '') {
        return num;
      }
      return interpolated;
    }
    return value;
  }

  /**
   * Execute ChatGPT node
   */
  private async executeChatGPT(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('ChatGPT node missing configuration');
    }

    // Try to get API key from stored integration, fallback to node config or env
    let apiKey = config.apiKey;
    if (!apiKey) {
      const integration = await this.integrationsService.getIntegrationCredentials(
        context.workspaceId,
        IntegrationType.CHATGPT,
      );
      apiKey = integration?.apiKey || this.configService.get('OPENAI_API_KEY');
    }

    const prompt = this.interpolateString(config.prompt || '', context);
    const model = config.model || 'gpt-3.5-turbo';

    if (!apiKey) {
      throw new Error('ChatGPT node missing API key. Please configure it in Settings > Integrations.');
    }

    if (!prompt) {
      throw new Error('ChatGPT node missing prompt');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: config.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`ChatGPT API error: ${error.error?.message || JSON.stringify(error)}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.choices[0]?.message?.content || '',
        usage: data.usage,
      };
    } catch (error) {
      throw new Error(
        `ChatGPT request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Execute WhatsApp node
   */
  private async executeWhatsApp(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('WhatsApp node missing configuration');
    }

    // Get credentials from stored integration
    const integration = await this.integrationsService.getIntegrationCredentials(
      context.workspaceId,
      IntegrationType.WHATSAPP,
    );

    if (!integration) {
      throw new Error('WhatsApp integration not configured. Please set it up in Settings > Integrations.');
    }

    const apiKey = integration.apiKey || integration.token;
    const phoneNumber = this.interpolateString(config.phoneNumber || '', context);
    const message = this.interpolateString(config.message || '', context);

    if (!phoneNumber || !message) {
      throw new Error('WhatsApp node missing required fields (phoneNumber, message)');
    }

    // Integrate with Meta WhatsApp Business API
    try {
      // Log integration details for debugging - show ALL fields
      this.logger.log(`  📱 [WHATSAPP] Integration object received:`);
      this.logger.log(`  📱 [WHATSAPP]   - Keys: ${Object.keys(integration).join(', ')}`);
      this.logger.log(`  📱 [WHATSAPP]   - Full object (sanitized): ${JSON.stringify(
        Object.fromEntries(
          Object.entries(integration).map(([k, v]) => [
            k,
            typeof v === 'string' && v.length > 20 ? `${v.substring(0, 10)}...${v.substring(v.length - 5)}` : v
          ])
        ),
        null,
        2
      )}`);
      
      // Meta WhatsApp Business API credentials
      // Support both new field names (accessToken, phoneNumberId) and old field names (authToken) for migration
      // NOTE: phoneNumberId is NOT the phone number itself - it's a Meta-assigned ID (e.g., 890306300839946)
      const accessToken = integration.accessToken || integration.authToken;
      const phoneNumberId = integration.phoneNumberId; // Must be the Meta Phone Number ID, not the actual phone number
      const businessAccountId = integration.businessAccountId;
      const apiVersion = integration.apiVersion || 'v22.0'; // Updated to v22.0 as shown in Meta docs
      
      this.logger.log(`  📱 [WHATSAPP] Credentials check:`);
      this.logger.log(`  📱 [WHATSAPP]   - accessToken: ${accessToken ? `present (${accessToken.substring(0, 10)}...)` : 'MISSING'}`);
      this.logger.log(`  📱 [WHATSAPP]   - phoneNumberId: ${phoneNumberId || 'MISSING'}`);
      this.logger.log(`  📱 [WHATSAPP]   - businessAccountId: ${businessAccountId || 'not set'}`);
      this.logger.log(`  📱 [WHATSAPP]   - apiVersion: ${apiVersion}`);
      
      // Warn if using old field names
      if (integration.authToken && !integration.accessToken) {
        this.logger.warn(`  ⚠️  [WHATSAPP] Using legacy 'authToken' field. Please update to 'accessToken' in Settings > Integrations > WhatsApp.`);
      }
      
      // Validate required fields
      if (!accessToken) {
        this.logger.error(`  ❌ [WHATSAPP] Missing Access Token. Available fields: ${Object.keys(integration).join(', ')}`);
        throw new Error('WhatsApp Meta API requires Access Token. Please configure it in Settings > Integrations > WhatsApp.');
      }
      
      if (!phoneNumberId) {
        this.logger.error(`  ❌ [WHATSAPP] Missing Phone Number ID. Available fields: ${Object.keys(integration).join(', ')}`);
        this.logger.error(`  ❌ [WHATSAPP] NOTE: Phone Number ID is NOT your phone number. It's a Meta-assigned ID (e.g., 890306300839946).`);
        this.logger.error(`  ❌ [WHATSAPP] Find it in Meta Business Suite > WhatsApp Manager > Phone Numbers > Your number > Details`);
        throw new Error('WhatsApp Meta API requires Phone Number ID (not your phone number, but the Meta-assigned ID like 890306300839946). Please configure it in Settings > Integrations > WhatsApp.');
      }
      
      // Validate that phoneNumberId looks like a Meta ID (numeric, typically 15 digits)
      if (!/^\d{10,20}$/.test(phoneNumberId)) {
        this.logger.error(`  ❌ [WHATSAPP] Invalid Phone Number ID format: ${phoneNumberId}`);
        this.logger.error(`  ❌ [WHATSAPP] Phone Number ID should be a numeric Meta-assigned ID (e.g., 890306300839946), not a phone number.`);
        throw new Error(`Invalid Phone Number ID format. It should be a Meta-assigned numeric ID (e.g., 890306300839946), not a phone number. Current value: ${phoneNumberId}`);
      }
      
      // Format phone number (remove + and any spaces)
      const formattedPhoneNumber = phoneNumber.replace(/[\s\+]/g, '');
      
      // Meta WhatsApp Business API endpoint
      const apiUrl = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
      
      this.logger.log(`  📱 [WHATSAPP] Sending via Meta API to ${formattedPhoneNumber}`);
      this.logger.log(`  📱 [WHATSAPP] API URL: ${apiUrl}`);
      this.logger.log(`  📱 [WHATSAPP] Request payload: ${JSON.stringify({
        messaging_product: 'whatsapp',
        to: formattedPhoneNumber,
        type: 'text',
        text: { body: message },
      }, null, 2)}`);

      const requestBody = {
        messaging_product: 'whatsapp',
        to: formattedPhoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = { raw: responseText };
      }

      // Log full response
      this.logger.log(`  📱 [WHATSAPP] Meta API Response Status: ${response.status} ${response.statusText}`);
      this.logger.log(`  📱 [WHATSAPP] Meta API Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
      this.logger.log(`  📱 [WHATSAPP] Meta API Response Body: ${JSON.stringify(responseData, null, 2)}`);

      if (!response.ok) {
        const errorCode = responseData?.error?.code || 'Unknown';
        const errorMessage = responseData?.error?.message || responseData?.error?.error_user_msg || responseText || 'Unknown error';
        const errorType = responseData?.error?.type || 'Unknown';
        const errorSubcode = responseData?.error?.error_subcode || null;
        
        this.logger.error(`  ❌ [WHATSAPP] Meta API Error Details:`);
        this.logger.error(`     - Status: ${response.status} ${response.statusText}`);
        this.logger.error(`     - Error Code: ${errorCode}`);
        this.logger.error(`     - Error Type: ${errorType}`);
        this.logger.error(`     - Error Subcode: ${errorSubcode || 'N/A'}`);
        this.logger.error(`     - Error Message: ${errorMessage}`);
        this.logger.error(`     - Full Error Object: ${JSON.stringify(responseData?.error || responseData, null, 2)}`);
        
        throw new Error(`WhatsApp Meta API error (${response.status}): [${errorCode}] ${errorType} - ${errorMessage}`);
      }

      // Success response
      const messageId = responseData?.messages?.[0]?.id || responseData?.id || 'unknown';
      this.logger.log(`  ✅ [WHATSAPP] Message sent successfully!`);
      this.logger.log(`  ✅ [WHATSAPP] Message ID: ${messageId}`);
      this.logger.log(`  ✅ [WHATSAPP] Full Meta API Response: ${JSON.stringify(responseData, null, 2)}`);
      
      return {
        success: true,
        phoneNumber: formattedPhoneNumber,
        message,
        messageId,
        metaResponse: responseData,
      };
    } catch (error) {
      throw new Error(
        `WhatsApp request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Execute Telegram node
   */
  private async executeTelegram(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Telegram node missing configuration');
    }

    // Get credentials from stored integration
    let botToken = config.botToken;
    if (!botToken) {
      const integration = await this.integrationsService.getIntegrationCredentials(
        context.workspaceId,
        IntegrationType.TELEGRAM,
      );
      botToken = integration?.botToken || this.configService.get('TELEGRAM_BOT_TOKEN');
    }

    const chatId = this.interpolateString(config.chatId || '', context);
    const message = this.interpolateString(config.message || '', context);

    if (!botToken) {
      throw new Error('Telegram integration not configured. Please set it up in Settings > Integrations.');
    }

    if (!chatId || !message) {
      throw new Error('Telegram node missing required fields (chatId, message)');
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: config.parseMode || 'HTML',
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Telegram API error: ${error.description || JSON.stringify(error)}`);
      }

      const data = await response.json();
      return {
        success: true,
        messageId: data.result?.message_id,
        chatId,
      };
    } catch (error) {
      throw new Error(
        `Telegram request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Execute Slack node
   */
  private async executeSlack(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Slack node missing configuration');
    }

    // Get credentials from stored integration
    let webhookUrl = config.webhookUrl;
    if (!webhookUrl) {
      const integration = await this.integrationsService.getIntegrationCredentials(
        context.workspaceId,
        IntegrationType.SLACK,
      );
      webhookUrl = integration?.webhookUrl || this.configService.get('SLACK_WEBHOOK_URL');
    }

    const channel = this.interpolateString(config.channel || '', context);
    const message = this.interpolateString(config.message || '', context);

    if (!webhookUrl) {
      throw new Error('Slack integration not configured. Please set it up in Settings > Integrations.');
    }

    if (!message) {
      throw new Error('Slack node missing required field (message)');
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channel || undefined,
          text: message,
          username: config.username || 'Workflow Bot',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Slack webhook error: ${error}`);
      }

      return {
        success: true,
        channel,
        message,
      };
    } catch (error) {
      throw new Error(
        `Slack request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Execute SMS node
   */
  private async executeSMS(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('SMS node missing configuration');
    }

    // Get credentials from stored integration
    const integration = await this.integrationsService.getIntegrationCredentials(
      context.workspaceId,
      IntegrationType.SMS,
    );

    if (!integration) {
      throw new Error('SMS integration not configured. Please set it up in Settings > Integrations.');
    }

    const phoneNumber = this.interpolateString(config.phoneNumber || '', context);
    const message = this.interpolateString(config.message || '', context);

    if (!phoneNumber || !message) {
      throw new Error('SMS node missing required fields (phoneNumber, message)');
    }

    // Integrate with SMS provider (Twilio, etc.)
    try {
      if (integration.provider === 'twilio') {
        const accountSid = integration.accountSid;
        const authToken = integration.authToken || integration.apiKey;
        const fromNumber = integration.fromNumber;

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            },
            body: new URLSearchParams({
              From: fromNumber,
              To: phoneNumber,
              Body: message,
            }),
          },
        );

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`SMS API error: ${error}`);
        }

        const data = await response.json();
        return {
          success: true,
          phoneNumber,
          message,
          messageId: data.sid,
        };
      }

      // Generic webhook-based SMS integration
      if (integration.webhookUrl) {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (integration.apiKey) {
          headers.Authorization = `Bearer ${integration.apiKey}`;
        }
        const response = await fetch(integration.webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            to: phoneNumber,
            message,
          }),
        });

        if (!response.ok) {
          throw new Error(`SMS webhook error: ${response.statusText}`);
        }

        return {
          success: true,
          phoneNumber,
          message,
        };
      }

      throw new Error('SMS integration not properly configured');
    } catch (error) {
      throw new Error(
        `SMS request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Execute Log node
   */
  private async executeLog(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    const message = this.interpolateString(config.message || '{{data}}', context);
    const level = config.level || 'info';

    this.logger.log(`  📝 [LOG] ${message}`);

    return {
      logged: true,
      message,
      level,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute Transform node
   */
  private async executeTransform(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Transform node missing configuration');
    }

    const transformType = config.transformType || 'json';
    const input = context.data;

    let result: any = input;

    switch (transformType) {
      case 'json':
        try {
          const jsonString = this.interpolateString(config.jsonString || '{{data}}', context);
          result = JSON.parse(jsonString);
        } catch (error) {
          throw new Error(`JSON transform failed: ${error instanceof Error ? error.message : String(error)}`);
        }
        break;

      case 'stringify':
        result = JSON.stringify(input);
        break;

      case 'uppercase':
        result = String(input).toUpperCase();
        break;

      case 'lowercase':
        result = String(input).toLowerCase();
        break;

      case 'trim':
        result = String(input).trim();
        break;

      case 'replace':
        const search = config.search || '';
        const replace = config.replace || '';
        result = String(input).replace(new RegExp(search, 'g'), replace);
        break;

      default:
        result = input;
    }

    return result;
  }

  /**
   * Execute Filter node
   */
  private async executeFilter(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Filter node missing configuration');
    }

    const input = Array.isArray(context.data) ? context.data : [context.data];
    const filterField = config.filterField || '';
    const filterOperator = config.filterOperator || '==';
    const filterValue = this.interpolateValue(config.filterValue || '', context);

    const filtered = input.filter((item: any) => {
      const fieldValue = filterField ? (item[filterField] || item) : item;
      
      switch (filterOperator) {
        case '==':
          return fieldValue == filterValue;
        case '!=':
          return fieldValue != filterValue;
        case '>':
          return fieldValue > filterValue;
        case '<':
          return fieldValue < filterValue;
        case '>=':
          return fieldValue >= filterValue;
        case '<=':
          return fieldValue <= filterValue;
        case 'contains':
          return String(fieldValue).includes(String(filterValue));
        default:
          return true;
      }
    });

    return filtered;
  }

  /**
   * Execute Loop node
   */
  private async executeLoop(
    node: any,
    workflow: any,
    context: WorkflowContext,
    executionId: string,
  ): Promise<any> {
    const config = node.config as any;
    if (!config) {
      throw new Error('Loop node missing configuration');
    }

    const loopType = config.loopType || 'foreach';
    const input = Array.isArray(context.data) ? context.data : [context.data];
    const results: any[] = [];

    if (loopType === 'foreach') {
      for (let i = 0; i < input.length; i++) {
        const item = input[i];
        const loopContext = {
          ...context,
          data: item,
          variables: {
            ...context.variables,
            loopIndex: i,
            loopItem: item,
          },
        };

        // Find next nodes to execute
        const outgoingEdges = workflow.edges.filter(
          (e: any) => e.sourceNodeId === node.id,
        );

        for (const edge of outgoingEdges) {
          const nextNode = workflow.nodes.find(
            (n: any) => n.id === edge.targetNodeId,
          );

          if (nextNode) {
            const result = await this.executeNode(
              nextNode,
              workflow,
              loopContext,
              executionId,
            );
            results.push(result);
          }
        }
      }
    } else if (loopType === 'while') {
      const condition = config.condition || 'true';
      let iterations = 0;
      const maxIterations = config.maxIterations || 100;

      while (iterations < maxIterations) {
        const conditionResult = this.interpolateString(condition, context) === 'true';
        if (!conditionResult) break;

        // Execute loop body
        const outgoingEdges = workflow.edges.filter(
          (e: any) => e.sourceNodeId === node.id,
        );

        for (const edge of outgoingEdges) {
          const nextNode = workflow.nodes.find(
            (n: any) => n.id === edge.targetNodeId,
          );

          if (nextNode) {
            const result = await this.executeNode(
              nextNode,
              workflow,
              context,
              executionId,
            );
            results.push(result);
          }
        }

        iterations++;
      }
    }

    return results;
  }

  /**
   * Execute Merge node
   */
  private async executeMerge(node: any, context: WorkflowContext): Promise<any> {
    // Merge node combines data from multiple incoming edges
    // For now, we'll merge all variables and data
    return {
      ...context.data,
      ...context.variables,
      merged: true,
    };
  }

  /**
   * Execute Split node
   */
  private async executeSplit(node: any, context: WorkflowContext): Promise<any> {
    const config = node.config as any;
    const input = context.data;
    const splitField = config.splitField || '';

    if (Array.isArray(input)) {
      // Split array into multiple outputs
      return input.map((item, index) => ({
        ...item,
        splitIndex: index,
      }));
    } else if (splitField && typeof input === 'object') {
      // Split object by field
      const fieldValue = input[splitField];
      if (Array.isArray(fieldValue)) {
        return fieldValue;
      }
      return [fieldValue];
    }

    return [input];
  }
}
