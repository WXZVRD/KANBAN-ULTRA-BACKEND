import { Inject, Injectable, Logger } from '@nestjs/common';
import { IRedisService } from '../redis/redis.service';
import { ProjectAnalyticsDto } from './dto/project-analytic.dto';
import ms from 'ms';
import { TasksCreatedPerDayCollector } from './collectors/task-created-per-day.collector';
import { RedisKey } from '../../libs/common/types/redis.types';

export interface IAnalyticService {
  getProjectAnalytics(projectId: string): Promise<ProjectAnalyticsDto>;
}

@Injectable()
export class AnalyticsService implements IAnalyticService {
  private readonly logger: Logger = new Logger(AnalyticsService.name);

  constructor(
    @Inject('IRedisService')
    private readonly redisService: IRedisService,
    private readonly tasksCreatedCollector: TasksCreatedPerDayCollector,
  ) {}

  async getProjectAnalytics(projectId: string): Promise<ProjectAnalyticsDto> {
    const cached: ProjectAnalyticsDto | null = await this.redisService.get(
      RedisKey.AnalyticProject,
      projectId,
    );

    if (cached) {
      this.logger.debug(
        `Analytics for project ${projectId} retrieved from cache`,
      );
      return cached;
    }

    this.logger.log(`Collecting analytics for project ${projectId}`);

    const tasksCreatedPerDay =
      await this.tasksCreatedCollector.collect(projectId);

    const analytics: ProjectAnalyticsDto = {
      tasksCreatedPerDay,
    };

    await this.redisService.set(
      RedisKey.AnalyticProject,
      analytics,
      ms('1m'),
      projectId,
    );
    return analytics;
  }
}
