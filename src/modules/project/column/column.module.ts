import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectColumn } from './entity/column.entity';
import { UserModule } from '../../user/user.module';
import { MembershipModule } from '../membership/membership.module';
import { ProjectColumnController } from './column.controller';
import { ProjectColumnService } from './column.service';
import { ProjectColumnRepository } from './repository/column.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectColumn]),
    UserModule,
    MembershipModule,
  ],
  controllers: [ProjectColumnController],
  providers: [
    {
      provide: 'IProjectColumnService',
      useClass: ProjectColumnService,
    },
    {
      provide: 'IProjectColumnRepository',
      useClass: ProjectColumnRepository,
    },
  ],
  exports: ['IProjectColumnService', 'IProjectColumnRepository'],
})
export class ColumnModule {}
