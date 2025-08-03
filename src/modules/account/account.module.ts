import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entity/account.entity';
import { AccountService } from './account.service';
import { AccountRepository } from './repositories/account.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [AccountService, AccountRepository],
  exports: [AccountService],
})
export class AccountModule {}
