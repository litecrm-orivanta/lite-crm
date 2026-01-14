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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const integrations_service_1 = require("./integrations.service");
const client_1 = require("@prisma/client");
let IntegrationsController = class IntegrationsController {
    integrationsService;
    constructor(integrationsService) {
        this.integrationsService = integrationsService;
    }
    async getIntegrations(req) {
        const workspaceId = req.user.workspaceId;
        return this.integrationsService.getIntegrations(workspaceId);
    }
    async getIntegration(req, type) {
        const workspaceId = req.user.workspaceId;
        return this.integrationsService.getIntegration(workspaceId, type);
    }
    async createIntegration(req, body) {
        const workspaceId = req.user.workspaceId;
        return this.integrationsService.upsertIntegration(workspaceId, body.type, body.name, body.config, body.enabled !== undefined ? body.enabled : true);
    }
    async updateIntegration(req, type, body) {
        const workspaceId = req.user.workspaceId;
        const existing = await this.integrationsService.getIntegration(workspaceId, type);
        if (!existing) {
            throw new Error('Integration not found');
        }
        return this.integrationsService.upsertIntegration(workspaceId, type, body.name || existing.name, body.config || existing.config, body.enabled !== undefined ? body.enabled : existing.enabled);
    }
    async deleteIntegration(req, type) {
        const workspaceId = req.user.workspaceId;
        await this.integrationsService.deleteIntegration(workspaceId, type);
        return { success: true };
    }
};
exports.IntegrationsController = IntegrationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getIntegrations", null);
__decorate([
    (0, common_1.Get)(':type'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_a = typeof client_1.IntegrationType !== "undefined" && client_1.IntegrationType) === "function" ? _a : Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "getIntegration", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "createIntegration", null);
__decorate([
    (0, common_1.Put)(':type'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_b = typeof client_1.IntegrationType !== "undefined" && client_1.IntegrationType) === "function" ? _b : Object, Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "updateIntegration", null);
__decorate([
    (0, common_1.Delete)(':type'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typeof (_c = typeof client_1.IntegrationType !== "undefined" && client_1.IntegrationType) === "function" ? _c : Object]),
    __metadata("design:returntype", Promise)
], IntegrationsController.prototype, "deleteIntegration", null);
exports.IntegrationsController = IntegrationsController = __decorate([
    (0, common_1.Controller)('integrations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [integrations_service_1.IntegrationsService])
], IntegrationsController);
//# sourceMappingURL=integrations.controller.js.map