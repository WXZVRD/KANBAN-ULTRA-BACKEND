import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entity/account.entity';
import { Token } from './entity/token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Token])],
})
export class AccountModule {}
