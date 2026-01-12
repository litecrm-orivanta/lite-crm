import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // CORS configuration - allow requests from frontend
  // In production, FRONTEND_URL will be set to the GCP VM IP or domain
  const frontendUrl = process.env.FRONTEND_URL;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
  ];
  
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
    // Also allow HTTPS version if using HTTP
    if (frontendUrl.startsWith('http://')) {
      allowedOrigins.push(frontendUrl.replace('http://', 'https://'));
    }
  }

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is allowed
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        // For GCP deployment, allow all origins (can restrict later for production)
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
