import { Module } from '@nestjs/common';
import { ProjectService } from './service/project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entity/project.entity';
import { ProjectRepository } from './repository/project.repository';
import { ColumnModule } from './column/column.module';

@Module({
  imports: [TypeOrmModule.forFeature([Project]), ColumnModule],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
