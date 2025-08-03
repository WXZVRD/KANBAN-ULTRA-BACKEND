import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';

interface ApiAuthOptions {
  summary: string;
  okDescription: string;
  okType: any;
  bodyType?: any;
}

export function ApiAuthEndpoint(options: ApiAuthOptions) {
  const decorators: MethodDecorator[] = [
    ApiBearerAuth(),
    ApiOperation({ summary: options.summary }),
    ApiOkResponse({ description: options.okDescription, type: options.okType }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  ];

  if (options.bodyType) {
    decorators.push(ApiBody({ type: options.bodyType }));
  }

  return applyDecorators(...decorators);
}
