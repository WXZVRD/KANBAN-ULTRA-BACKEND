import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account, AccountRepository, AccountService } from './index';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountService, AccountRepository],
  exports: [AccountService],
})
export class AccountModule {}
