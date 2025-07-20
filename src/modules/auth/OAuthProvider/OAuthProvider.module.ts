import { Module } from '@nestjs/common';
import { AuthProviderService } from './OAuthProvider.service';

@Module({
  providers: [AuthProviderService],
})
export class AuthProviderModule {}
