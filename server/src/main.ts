import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure body size limits for file uploads
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));
  
  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Enable CORS for frontend - handle multiple origins
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5900';
  const origins = frontendUrl.split(',').map(url => url.trim());
  
  app.enableCors({
    origin: origins,
    credentials: true,
  });

  const port = process.env.PORT || 3900;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
  console.log(`🌐 CORS enabled for origins: ${origins.join(', ')}`);
}

bootstrap(); 