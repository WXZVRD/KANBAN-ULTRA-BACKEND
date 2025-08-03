import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entity/project.entity';
import { ColumnModule } from './column/column.module';
import { TaskModule } from './task/task.module';
import { UserModule } from '../user/user.module';
import { MembershipModule } from './membership/membership.module';
import { ProjectController } from './project.controller';
import { ProjectService } from './service/project.service';
import { ProjectRepository } from './repository/project.repository';
import { ProjectColumnService } from './column/column.service';
import { MembershipService } from './membership/services/membership.service';

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
