import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user';
import { TaskModule } from './task';
import {
  Project,
  ProjectController,
  ProjectService,
  ProjectRepository,
} from './index';
import { MembershipModule, MembershipService } from './membership';
import { ColumnModule, ProjectColumnService } from './column';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    ColumnModule,
    TaskModule,
    UserModule,
    MembershipModule,
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    ProjectRepository,
    ProjectColumnService,
    MembershipService,
  ],
})
export class ProjectModule {}
