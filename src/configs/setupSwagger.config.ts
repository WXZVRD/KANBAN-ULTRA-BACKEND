import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Project API')
    .setDescription('API documentation for my project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);
}
