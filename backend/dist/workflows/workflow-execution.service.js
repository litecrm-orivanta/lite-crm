"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkflowExecutionService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const notification_service_1 = require("../notifications/notification.service");
const config_1 = require("@nestjs/config");
const integrations_service_1 = require("../integrations/integrations.service");
let WorkflowExecutionService = WorkflowExecutionService_1 = class WorkflowExecutionService {
    prisma;
    notifications;
    configService;
    integrationsService;
    logger = new common_1.Logger(WorkflowExecutionService_1.name);
    constructor(prisma, notifications, configService, integrationsService) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.configService = configService;
        this.integrationsService = integrationsService;
    }
    async executeWorkflow(workflowId, context) {
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
        if (!workflow.active) {
            this.logger.warn(`Workflow ${workflowId} is inactive, skipping execution`);
            throw new Error('Workflow is inactive');
        }
        this.logger.log(`Workflow ${workflowId} has ${workflow.nodes?.length || 0} nodes`);
        const execution = await this.prisma.workflowExecution.create({
            data: {
                workflowId,
                status: client_1.WorkflowExecutionStatus.RUNNING,
                input: context.data,
                startedAt: new Date(),
            },
        });
        this.logger.log(`📝 [EXECUTION] Created execution record: ${execution.id} for workflow: ${workflowId}`);
        try {
            const triggerNode = workflow.nodes.find((n) => {
                const nodeType = typeof n.type === 'string' ? n.type : String(n.type);
                return nodeType === 'TRIGGER' || nodeType === client_1.WorkflowNodeType.TRIGGER;
            });
            if (!triggerNode) {
                this.logger.error(`❌ [EXECUTION] No trigger node found in workflow ${workflowId}`);
                throw new Error('No trigger node found in workflow');
            }
            this.logger.log(`🎯 [EXECUTION] Found trigger node: ${triggerNode.nodeId} with event: ${triggerNode.triggerEvent}`);
            if (triggerNode.triggerEvent !== context.event) {
                this.logger.warn(`⚠️  [EXECUTION] Trigger event mismatch. Expected: ${context.event}, Got: ${triggerNode.triggerEvent}`);
                throw new Error('Trigger event does not match');
            }
            this.logger.log(`🚀 [EXECUTION] Starting workflow execution from trigger node...`);
            const result = await this.executeNode(triggerNode, workflow, context, execution.id);
            this.logger.log(`✅ [EXECUTION] Workflow execution completed successfully. Execution ID: ${execution.id}`);
            await this.prisma.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: client_1.WorkflowExecutionStatus.SUCCESS,
                    output: result,
                    completedAt: new Date(),
                },
            });
            return execution.id;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`❌ [EXECUTION] Workflow execution failed. Execution ID: ${execution.id} | Error: ${errorMessage}`, error instanceof Error ? error.stack : undefined);
            await this.prisma.workflowExecution.update({
                where: { id: execution.id },
                data: {
                    status: client_1.WorkflowExecutionStatus.FAILED,
                    error: errorMessage,
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }
    async executeNode(node, workflow, context, executionId) {
        const nodeType = typeof node.type === 'string' ? node.type : String(node.type);
        this.logger.log(`  🔹 [NODE] Executing node: ${node.nodeId || node.id} (${nodeType})`);
        let result = null;
        switch (nodeType.toUpperCase()) {
            case 'TRIGGER':
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
        if (result) {
            context.variables[`${node.nodeId}_output`] = result;
        }
        const outgoingEdges = workflow.edges.filter((e) => e.sourceNodeId === node.id);
        this.logger.log(`  🔗 [NODE] Node ${node.nodeId || node.id} has ${outgoingEdges.length} outgoing edge(s)`);
        const nextResults = [];
        for (const edge of outgoingEdges) {
            const nextNode = workflow.nodes.find((n) => n.id === edge.targetNodeId);
            if (nextNode) {
                const currentNodeType = typeof node.type === 'string' ? node.type : String(node.type);
                if (currentNodeType.toUpperCase() === 'CONDITION') {
                    const shouldFollow = this.shouldFollowConditionPath(edge, result, node);
                    if (!shouldFollow) {
                        this.logger.log(`  ⏭️  [NODE] Skipping edge (condition false): ${edge.edgeId || edge.id}`);
                        continue;
                    }
                    this.logger.log(`  ✅ [NODE] Following edge (condition true): ${edge.edgeId || edge.id}`);
                }
                const nextResult = await this.executeNode(nextNode, workflow, context, executionId);
                nextResults.push(nextResult);
            }
            else {
                this.logger.warn(`  ⚠️  [NODE] Target node not found for edge: ${edge.edgeId || edge.id}`);
            }
        }
        this.logger.log(`  ✅ [NODE] Node ${node.nodeId || node.id} completed`);
        return result;
    }
    async executeHttpRequest(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('HTTP Request node missing configuration');
        }
        const url = this.interpolateString(config.url || '', context);
        const method = config.method || 'GET';
        const headers = this.interpolateObject(config.headers || {}, context);
        const body = config.body ? this.interpolateString(config.body, context) : undefined;
        try {
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
        }
        catch (error) {
            throw new Error(`HTTP Request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeEmail(node, context) {
        const config = node.config;
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
            await this.notifications.sendEmail(to, subject, body);
            return { success: true, to, subject };
        }
        catch (error) {
            throw new Error(`Email sending failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeDelay(node, context) {
        const config = node.config;
        const delayMs = parseInt(config.delayMs || '1000', 10);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return { delayed: delayMs };
    }
    async executeCondition(node, context) {
        const config = node.config;
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
    async executeSetVariable(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('Set Variable node missing configuration');
        }
        const variableName = config.variableName || '';
        const variableValue = this.interpolateValue(config.variableValue || '', context);
        context.variables[variableName] = variableValue;
        return { [variableName]: variableValue };
    }
    async executeWebhook(node, context) {
        const config = node.config;
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
        }
        catch (error) {
            throw new Error(`Webhook failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    shouldFollowConditionPath(edge, conditionResult, conditionNode) {
        const edgeLabel = edge.edgeId?.toLowerCase() || '';
        if (edgeLabel.includes('true') && conditionResult) {
            return true;
        }
        if (edgeLabel.includes('false') && !conditionResult) {
            return true;
        }
        return conditionResult;
    }
    interpolateString(template, context) {
        let result = template;
        result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            const trimmedKey = key.trim();
            if (context.data[trimmedKey] !== undefined) {
                return String(context.data[trimmedKey]);
            }
            if (context.variables[trimmedKey] !== undefined) {
                return String(context.variables[trimmedKey]);
            }
            const parts = trimmedKey.split('.');
            let value = context.data;
            for (const part of parts) {
                if (value && typeof value === 'object' && part in value) {
                    value = value[part];
                }
                else {
                    value = undefined;
                    break;
                }
            }
            if (value !== undefined) {
                return String(value);
            }
            return match;
        });
        return result;
    }
    interpolateObject(obj, context) {
        if (typeof obj === 'string') {
            return this.interpolateString(obj, context);
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.interpolateObject(item, context));
        }
        if (obj && typeof obj === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.interpolateObject(value, context);
            }
            return result;
        }
        return obj;
    }
    interpolateValue(value, context) {
        if (typeof value === 'string') {
            const interpolated = this.interpolateString(value, context);
            const num = Number(interpolated);
            if (!isNaN(num) && interpolated.trim() !== '') {
                return num;
            }
            return interpolated;
        }
        return value;
    }
    async executeChatGPT(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('ChatGPT node missing configuration');
        }
        let apiKey = config.apiKey;
        if (!apiKey) {
            const integration = await this.integrationsService.getIntegrationCredentials(context.workspaceId, client_1.IntegrationType.CHATGPT);
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
        }
        catch (error) {
            throw new Error(`ChatGPT request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeWhatsApp(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('WhatsApp node missing configuration');
        }
        const integration = await this.integrationsService.getIntegrationCredentials(context.workspaceId, client_1.IntegrationType.WHATSAPP);
        if (!integration) {
            throw new Error('WhatsApp integration not configured. Please set it up in Settings > Integrations.');
        }
        const apiKey = integration.apiKey || integration.token;
        const phoneNumber = this.interpolateString(config.phoneNumber || '', context);
        const message = this.interpolateString(config.message || '', context);
        if (!phoneNumber || !message) {
            throw new Error('WhatsApp node missing required fields (phoneNumber, message)');
        }
        try {
            if (integration.provider === 'twilio') {
                const accountSid = integration.accountSid;
                const authToken = apiKey;
                const fromNumber = integration.fromNumber || 'whatsapp:+14155238886';
                const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
                    },
                    body: new URLSearchParams({
                        From: fromNumber,
                        To: phoneNumber.startsWith('whatsapp:') ? phoneNumber : `whatsapp:${phoneNumber}`,
                        Body: message,
                    }),
                });
                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(`WhatsApp API error: ${error}`);
                }
                const data = await response.json();
                return {
                    success: true,
                    phoneNumber,
                    message,
                    messageId: data.sid,
                };
            }
            if (integration.webhookUrl) {
                const response = await fetch(integration.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
                    },
                    body: JSON.stringify({
                        to: phoneNumber,
                        message,
                    }),
                });
                if (!response.ok) {
                    throw new Error(`WhatsApp webhook error: ${response.statusText}`);
                }
                return {
                    success: true,
                    phoneNumber,
                    message,
                };
            }
            throw new Error('WhatsApp integration not properly configured');
        }
        catch (error) {
            throw new Error(`WhatsApp request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeTelegram(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('Telegram node missing configuration');
        }
        let botToken = config.botToken;
        if (!botToken) {
            const integration = await this.integrationsService.getIntegrationCredentials(context.workspaceId, client_1.IntegrationType.TELEGRAM);
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
            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: config.parseMode || 'HTML',
                }),
            });
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
        }
        catch (error) {
            throw new Error(`Telegram request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeSlack(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('Slack node missing configuration');
        }
        let webhookUrl = config.webhookUrl;
        if (!webhookUrl) {
            const integration = await this.integrationsService.getIntegrationCredentials(context.workspaceId, client_1.IntegrationType.SLACK);
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
        }
        catch (error) {
            throw new Error(`Slack request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeSMS(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('SMS node missing configuration');
        }
        const integration = await this.integrationsService.getIntegrationCredentials(context.workspaceId, client_1.IntegrationType.SMS);
        if (!integration) {
            throw new Error('SMS integration not configured. Please set it up in Settings > Integrations.');
        }
        const phoneNumber = this.interpolateString(config.phoneNumber || '', context);
        const message = this.interpolateString(config.message || '', context);
        if (!phoneNumber || !message) {
            throw new Error('SMS node missing required fields (phoneNumber, message)');
        }
        try {
            if (integration.provider === 'twilio') {
                const accountSid = integration.accountSid;
                const authToken = integration.authToken || integration.apiKey;
                const fromNumber = integration.fromNumber;
                const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
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
                });
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
            if (integration.webhookUrl) {
                const response = await fetch(integration.webhookUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: integration.apiKey ? `Bearer ${integration.apiKey}` : undefined,
                    },
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
        }
        catch (error) {
            throw new Error(`SMS request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async executeLog(node, context) {
        const config = node.config;
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
    async executeTransform(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('Transform node missing configuration');
        }
        const transformType = config.transformType || 'json';
        const input = context.data;
        let result = input;
        switch (transformType) {
            case 'json':
                try {
                    const jsonString = this.interpolateString(config.jsonString || '{{data}}', context);
                    result = JSON.parse(jsonString);
                }
                catch (error) {
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
    async executeFilter(node, context) {
        const config = node.config;
        if (!config) {
            throw new Error('Filter node missing configuration');
        }
        const input = Array.isArray(context.data) ? context.data : [context.data];
        const filterField = config.filterField || '';
        const filterOperator = config.filterOperator || '==';
        const filterValue = this.interpolateValue(config.filterValue || '', context);
        const filtered = input.filter((item) => {
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
    async executeLoop(node, workflow, context, executionId) {
        const config = node.config;
        if (!config) {
            throw new Error('Loop node missing configuration');
        }
        const loopType = config.loopType || 'foreach';
        const input = Array.isArray(context.data) ? context.data : [context.data];
        const results = [];
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
                const outgoingEdges = workflow.edges.filter((e) => e.sourceNodeId === node.id);
                for (const edge of outgoingEdges) {
                    const nextNode = workflow.nodes.find((n) => n.id === edge.targetNodeId);
                    if (nextNode) {
                        const result = await this.executeNode(nextNode, workflow, loopContext, executionId);
                        results.push(result);
                    }
                }
            }
        }
        else if (loopType === 'while') {
            const condition = config.condition || 'true';
            let iterations = 0;
            const maxIterations = config.maxIterations || 100;
            while (iterations < maxIterations) {
                const conditionResult = this.interpolateString(condition, context) === 'true';
                if (!conditionResult)
                    break;
                const outgoingEdges = workflow.edges.filter((e) => e.sourceNodeId === node.id);
                for (const edge of outgoingEdges) {
                    const nextNode = workflow.nodes.find((n) => n.id === edge.targetNodeId);
                    if (nextNode) {
                        const result = await this.executeNode(nextNode, workflow, context, executionId);
                        results.push(result);
                    }
                }
                iterations++;
            }
        }
        return results;
    }
    async executeMerge(node, context) {
        return {
            ...context.data,
            ...context.variables,
            merged: true,
        };
    }
    async executeSplit(node, context) {
        const config = node.config;
        const input = context.data;
        const splitField = config.splitField || '';
        if (Array.isArray(input)) {
            return input.map((item, index) => ({
                ...item,
                splitIndex: index,
            }));
        }
        else if (splitField && typeof input === 'object') {
            const fieldValue = input[splitField];
            if (Array.isArray(fieldValue)) {
                return fieldValue;
            }
            return [fieldValue];
        }
        return [input];
    }
};
exports.WorkflowExecutionService = WorkflowExecutionService;
exports.WorkflowExecutionService = WorkflowExecutionService = WorkflowExecutionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService, typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object, integrations_service_1.IntegrationsService])
], WorkflowExecutionService);
//# sourceMappingURL=workflow-execution.service.js.map