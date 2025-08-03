import { Controller, Inject } from '@nestjs/common';
import { IAnalyticService } from './analytic.service';

@Controller('analytic')
export class AnalyticController {
  constructor(
    @Inject('IAnalyticService')
    private readonly analyticService: IAnalyticService,
  ) {}
}
