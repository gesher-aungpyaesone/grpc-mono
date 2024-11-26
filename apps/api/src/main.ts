import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import helmet from '@fastify/helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomValidationPipe } from 'utils';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(new CustomValidationPipe());

  if (process.env.NODE_ENV === 'production') {
    app.enableCors({
      origin: [process.env.STAFF_FRONTEND_URL],
      credentials: true,
    });
    app.register(helmet, {
      contentSecurityPolicy: false,
    });
  } else {
    app.enableCors();
  }

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Gesher Station APIs')
    .setDescription('API gateway for Gesher Station')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('doc', app, documentFactory);
  }

  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0');
}
bootstrap();
