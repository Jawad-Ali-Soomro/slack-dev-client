import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './modules/common/filters/global-exception/global-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CreateUserDto } from './modules/auth/dto/create-user.dto';
import { LoginUserDto, RefreshTokenDto } from './modules/auth/dto/login-user.dto';
import {
  ResendVerificationDto,
  VerifyEmailDto,
} from './modules/auth/dto/verify-email.dto';
import { CreateOrganizationDto } from './modules/organization/dto/org-dto';
import { UpdateOrganizationDto } from './modules/organization/dto/update-org-dto';
import { AddMemberDto, UpdateMemberDto } from './modules/organization/dto/member-dto';
import { CreateTeamDto } from './modules/team/dto/team-dto';
import { UpdateTeamDto } from './modules/team/dto/update-team-dto';
import { AddTeamMemberDto, UpdateTeamMemberDto } from './modules/team/dto/team-member-dto';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const apiVersion = process.env.APP_VERSION ?? 'v1';
  app.setGlobalPrefix(`/api/${apiVersion}`);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Multi-Tenants API')
    .setDescription(
      'REST API for authentication, email verification, organizations, teams, and file uploads.',
    )
    .setVersion(apiVersion)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Registration, login, email verification, and sessions')
    .addTag('Organizations', 'Organization CRUD and member management')
    .addTag('Teams', 'Team CRUD and team member management')
    .addTag('Uploads', 'Avatar, organization logo, and product image uploads')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
    extraModels: [
      CreateUserDto,
      LoginUserDto,
      RefreshTokenDto,
      VerifyEmailDto,
      ResendVerificationDto,
      CreateOrganizationDto,
      UpdateOrganizationDto,
      AddMemberDto,
      UpdateMemberDto,
      CreateTeamDto,
      UpdateTeamDto,
      AddTeamMemberDto,
      UpdateTeamMemberDto,
    ],
  });
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
