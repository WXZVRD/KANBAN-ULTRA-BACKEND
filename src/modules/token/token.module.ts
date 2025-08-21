import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './entity/token.entity';
import { TokenRepository } from './repository/token.repository';
import { TokenService } from './token.service';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [
    {
      provide: 'ITokenService',
      useClass: TokenService,
    },
    {
      provide: 'ITokenRepository',
      useClass: TokenRepository,
    },
  ],
  exports: ['ITokenService', 'ITokenRepository'],
})
export class TokenModule {}
