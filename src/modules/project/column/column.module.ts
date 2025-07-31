import { Module } from '@nestjs/common';
import { ProjectColumnController } from './column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectColumn } from './entity/column.entity';
import { ProjectColumnRepository } from './repository/column.repository';
import { ProjectColumnService } from './column.service';
import { UserModule } from '../../user/user.module';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectColumn]),
    UserModule,
    MembershipModule,
  ],
  controllers: [ProjectColumnController],
  providers: [ProjectColumnService, ProjectColumnRepository],
  exports: [ProjectColumnService, ProjectColumnRepository],
})
export class ColumnModule {}
