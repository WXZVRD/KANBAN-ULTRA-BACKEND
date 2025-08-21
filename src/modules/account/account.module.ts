import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entity/account.entity';
import { AccountService } from './account.service';
import { AccountRepository } from './repositories/account.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  providers: [
    {
      provide: 'IAccountService',
      useClass: AccountService,
    },
    {
      provide: 'IAccountRepository',
      useClass: AccountRepository,
    },
  ],
  exports: ['IAccountService', 'IAccountRepository'],
})
export class AccountModule {}
