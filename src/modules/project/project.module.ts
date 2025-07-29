import { Module } from '@nestjs/common';
import { ProjectService } from './service/project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entity/project.entity';
import { ProjectRepository } from './repository/project.repository';
import { ColumnModule } from './column/column.module';
import { ProjectColumnService } from './column/column.service';
import { UserModule } from '../user/user.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    ColumnModule,
    TaskModule,
    UserModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository, ProjectColumnService],
})
export class ProjectModule {}
