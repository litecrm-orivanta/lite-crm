import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IntegrationType } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);
  private readonly encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

  constructor(private prisma: PrismaService) {}

  /**
   * Encrypt sensitive data
   */
  private encrypt(text: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedText: string): string {
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

  /**
   * Get all integrations for a workspace
   */
  async getIntegrations(workspaceId: string) {
    const integrations = await this.prisma.workspaceIntegration.findMany({
      where: { workspaceId },
      select: {
        id: true,
        type: true,
        name: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        // Don't return config for security
      },
    });

    return integrations;
  }

  /**
   * Get a specific integration (with decrypted config)
   */
  async getIntegration(workspaceId: string, type: IntegrationType) {
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

    // Decrypt config
    const decryptedConfig = this.decryptConfig(integration.config as any);

    return {
      ...integration,
      config: decryptedConfig,
    };
  }

  /**
   * Create or update an integration
   */
  async upsertIntegration(
    workspaceId: string,
    type: IntegrationType,
    name: string,
    config: Record<string, any>,
    enabled: boolean = true,
  ) {
    // Encrypt sensitive fields
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

  /**
   * Delete an integration
   */
  async deleteIntegration(workspaceId: string, type: IntegrationType) {
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

  /**
   * Get integration credentials for workflow execution
   */
  async getIntegrationCredentials(workspaceId: string, type: IntegrationType): Promise<Record<string, any> | null> {
    this.logger.log(`Getting integration credentials for ${type} in workspace ${workspaceId}`);
    
    const integration = await this.prisma.workspaceIntegration.findUnique({
      where: {
        workspaceId_type: {
          workspaceId,
          type,
        },
      },
    });

    if (!integration) {
      this.logger.warn(`Integration ${type} not found for workspace ${workspaceId}`);
      return null;
    }

    if (!integration.enabled) {
      this.logger.warn(`Integration ${type} is disabled for workspace ${workspaceId}`);
      return null;
    }

    const decrypted = this.decryptConfig(integration.config as any);
    this.logger.log(`Integration ${type} credentials retrieved. Keys: ${Object.keys(decrypted).join(', ')}`);
    return decrypted;
  }

  /**
   * Encrypt config object (encrypts sensitive fields)
   */
  private encryptConfig(config: Record<string, any>): Record<string, any> {
    const encrypted: Record<string, any> = {};
    const sensitiveFields = ['apiKey', 'api_token', 'authToken', 'accessToken', 'botToken', 'webhookUrl', 'password', 'secret', 'token'];

    for (const [key, value] of Object.entries(config)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase())) && typeof value === 'string') {
        encrypted[key] = this.encrypt(value);
        this.logger.debug(`Encrypted field: ${key}`);
      } else {
        encrypted[key] = value;
      }
    }

    return encrypted;
  }

  /**
   * Decrypt config object
   */
  private decryptConfig(config: Record<string, any>): Record<string, any> {
    const decrypted: Record<string, any> = {};
    const sensitiveFields = ['apiKey', 'api_token', 'authToken', 'accessToken', 'botToken', 'webhookUrl', 'password', 'secret', 'token'];

    for (const [key, value] of Object.entries(config)) {
      // Check if this is an encrypted field (contains ':' which is the IV:encrypted format)
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase())) && typeof value === 'string' && value.includes(':')) {
        try {
          decrypted[key] = this.decrypt(value);
          this.logger.debug(`Decrypted field: ${key}`);
        } catch (error) {
          // If decryption fails, return as-is (might be unencrypted or wrong format)
          this.logger.warn(`Failed to decrypt field ${key}, using as-is. Error: ${error instanceof Error ? error.message : String(error)}`);
          decrypted[key] = value;
        }
      } else {
        decrypted[key] = value;
      }
    }

    this.logger.debug(`Decrypted config keys: ${Object.keys(decrypted).join(', ')}`);
    return decrypted;
  }
}
