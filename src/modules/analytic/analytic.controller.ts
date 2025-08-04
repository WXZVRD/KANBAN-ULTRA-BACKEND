import { Controller, Get, Inject, Param } from '@nestjs/common';
import { IAnalyticService } from './analytic.service';

@Controller('projects/:projectId/analytics')
export class AnalyticController {
  constructor(
    @Inject('IAnalyticService')
    private readonly analyticService: IAnalyticService,
  ) {}

  @Get()
  async getAnalytics(@Param('projectId') projectId: string) {
    return this.analyticService.getProjectAnalytics(projectId);
  }
}
