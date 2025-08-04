import { Module } from '@nestjs/common';
import { AnalyticController } from './analytic.controller';
import { RedisModule } from '../redis/redis.module';
import { AnalyticsService } from './analytic.service';
import { TasksCreatedPerDayCollector } from './collectors/task-created-per-day.collector';
import { TaskModule } from '../project/task/task.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../project/task';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), RedisModule, TaskModule],
  controllers: [AnalyticController],
  providers: [
    {
      provide: 'IAnalyticService',
      useClass: AnalyticsService,
    },
    TasksCreatedPerDayCollector,
  ],
  exports: ['IAnalyticService', TasksCreatedPerDayCollector],
})
export class AnalyticModule {}
