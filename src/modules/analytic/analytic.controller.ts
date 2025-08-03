import { Controller } from '@nestjs/common';
import { AnalyticService } from './analytic.service';

@Controller('analytic')
export class AnalyticController {
  constructor(private readonly analyticService: AnalyticService) {}
}
