"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const leads_module_1 = require("./leads/leads.module");
const tasks_module_1 = require("./tasks/tasks.module");
const activities_module_1 = require("./activities/activities.module");
const invites_module_1 = require("./invites/invites.module");
const users_module_1 = require("./users/users.module");
const notification_module_1 = require("./notifications/notification.module");
const workflows_module_1 = require("./workflows/workflows.module");
const integrations_module_1 = require("./integrations/integrations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            leads_module_1.LeadsModule,
            tasks_module_1.TasksModule,
            activities_module_1.ActivitiesModule,
            invites_module_1.InvitesModule,
            users_module_1.UsersModule,
            notification_module_1.NotificationModule,
            workflows_module_1.WorkflowsModule,
            integrations_module_1.IntegrationsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map