import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ProjectColumn,
  ProjectColumnController,
  ProjectColumnService,
  ProjectColumnRepository,
} from './index';
import { UserModule } from '../../user';
import { MembershipModule } from '../membership';

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
