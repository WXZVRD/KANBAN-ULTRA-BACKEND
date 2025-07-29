import { Module } from '@nestjs/common';
import { ProjectColumnController } from './column.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectColumn } from './entity/column.entity';
import { ProjectColumnRepository } from './repository/column.repository';
import { ProjectColumnService } from './column.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectColumn])],
  controllers: [ProjectColumnController],
  providers: [ProjectColumnService, ProjectColumnRepository],
  exports: [ProjectColumnService, ProjectColumnRepository],
})
export class ColumnModule {}
