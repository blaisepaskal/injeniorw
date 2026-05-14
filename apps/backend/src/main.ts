import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import compression from 'compression'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 3001)
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000')

  // Security
  app.use(helmet())
  app.use(compression())

  // CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('InjenioRw API')
      .setDescription("Rwanda's Engineering Talent Platform — REST API")
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('engineers', 'Engineer profiles & search')
      .addTag('clients', 'Client profiles')
      .addTag('jobs', 'Job postings')
      .addTag('proposals', 'Proposals')
      .addTag('contracts', 'Contracts & milestones')
      .addTag('payments', 'Payments via MTN MoMo')
      .addTag('messages', 'Messaging')
      .addTag('reviews', 'Reviews & ratings')
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
    logger.log(`📖 Swagger docs available at http://localhost:${port}/api/docs`)
  }

  await app.listen(port)
  logger.log(`🚀 InjenioRw API running on http://localhost:${port}/api/v1`)
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV', 'development')}`)
}

bootstrap()
