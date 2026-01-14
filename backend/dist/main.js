"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const frontendUrl = process.env.FRONTEND_URL;
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:8080',
    ];
    if (frontendUrl) {
        allowedOrigins.push(frontendUrl);
        if (frontendUrl.startsWith('http://')) {
            allowedOrigins.push(frontendUrl.replace('http://', 'https://'));
        }
    }
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
                callback(null, true);
            }
            else {
                callback(null, true);
            }
        },
        credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log('API running on http://localhost:' + port);
}
void bootstrap().catch((err) => {
    console.error('Failed to start NestJS');
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map