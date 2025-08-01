import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token, TokenService, TokenRepository } from './index';

@Module({
  imports: [TypeOrmModule.forFeature([Token])],
  providers: [TokenService, TokenRepository],
  exports: [TokenService, TokenRepository],
})
export class TokenModule {}
