import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IAuthProviderService } from '../OAuthProvider/OAuthProvider.service';
import { BaseOauthService } from '../OAuthProvider/services/base-oauth.service';
import { Request } from 'express';

@Injectable()
export class AuthProviderGuard implements CanActivate {
  public constructor(
    @Inject('IAuthProviderService')
    private readonly authProviderService: IAuthProviderService,
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest() as Request;

    const provider: string = request.params.provider;

    const providerInstance: BaseOauthService | null =
      this.authProviderService.findByService(provider);

    if (!providerInstance) {
      throw new NotFoundException(
        `Провайдер "${provider}" не найден. Пожалуйста, проверьте правильность введенных данных.`,
      );
    }

    return true;
  }
}
