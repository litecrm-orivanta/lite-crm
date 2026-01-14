"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var IntegrationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let IntegrationsService = IntegrationsService_1 = class IntegrationsService {
    prisma;
    logger = new common_1.Logger(IntegrationsService_1.name);
    encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    constructor(prisma) {
        this.prisma = prisma;
    }
    encrypt(text) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }
    decrypt(encryptedText) {
        const algorithm = 'aes-256-cbc';
        const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async getIntegrations(workspaceId) {
        const integrations = await this.prisma.workspaceIntegration.findMany({
            where: { workspaceId },
            select: {
                id: true,
                type: true,
                name: true,
                enabled: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return integrations;
    }
    async getIntegration(workspaceId, type) {
        const integration = await this.prisma.workspaceIntegration.findUnique({
            where: {
                workspaceId_type: {
                    workspaceId,
                    type,
                },
            },
        });
        if (!integration) {
            return null;
        }
        const decryptedConfig = this.decryptConfig(integration.config);
        return {
            ...integration,
            config: decryptedConfig,
        };
    }
    async upsertIntegration(workspaceId, type, name, config, enabled = true) {
        const encryptedConfig = this.encryptConfig(config);
        const integration = await this.prisma.workspaceIntegration.upsert({
            where: {
                workspaceId_type: {
                    workspaceId,
                    type,
                },
            },
            update: {
                name,
                config: encryptedConfig,
                enabled,
                updatedAt: new Date(),
            },
            create: {
                workspaceId,
                type,
                name,
                config: encryptedConfig,
                enabled,
            },
        });
        this.logger.log(`Integration ${type} ${integration.enabled ? 'enabled' : 'disabled'} for workspace ${workspaceId}`);
        return {
            id: integration.id,
            type: integration.type,
            name: integration.name,
            enabled: integration.enabled,
            createdAt: integration.createdAt,
            updatedAt: integration.updatedAt,
        };
    }
    async deleteIntegration(workspaceId, type) {
        await this.prisma.workspaceIntegration.delete({
            where: {
                workspaceId_type: {
                    workspaceId,
                    type,
                },
            },
        });
        this.logger.log(`Integration ${type} deleted for workspace ${workspaceId}`);
    }
    async getIntegrationCredentials(workspaceId, type) {
        const integration = await this.prisma.workspaceIntegration.findUnique({
            where: {
                workspaceId_type: {
                    workspaceId,
                    type,
                },
            },
        });
        if (!integration || !integration.enabled) {
            return null;
        }
        return this.decryptConfig(integration.config);
    }
    encryptConfig(config) {
        const encrypted = {};
        const sensitiveFields = ['apiKey', 'api_token', 'botToken', 'webhookUrl', 'password', 'secret', 'token'];
        for (const [key, value] of Object.entries(config)) {
            if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase())) && typeof value === 'string') {
                encrypted[key] = this.encrypt(value);
            }
            else {
                encrypted[key] = value;
            }
        }
        return encrypted;
    }
    decryptConfig(config) {
        const decrypted = {};
        const sensitiveFields = ['apiKey', 'api_token', 'botToken', 'webhookUrl', 'password', 'secret', 'token'];
        for (const [key, value] of Object.entries(config)) {
            if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase())) && typeof value === 'string' && value.includes(':')) {
                try {
                    decrypted[key] = this.decrypt(value);
                }
                catch (error) {
                    decrypted[key] = value;
                }
            }
            else {
                decrypted[key] = value;
            }
        }
        return decrypted;
    }
};
exports.IntegrationsService = IntegrationsService;
exports.IntegrationsService = IntegrationsService = IntegrationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IntegrationsService);
//# sourceMappingURL=integrations.service.js.map