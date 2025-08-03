import { Module } from '@nestjs/common';
import { AnalyticService } from './analytic.service';
import { AnalyticController } from './analytic.controller';

@Module({
  controllers: [AnalyticController],
  providers: [
    {
      provide: 'IAnalyticService',
      useClass: AnalyticService,
    },
  ],
})
export class AnalyticModule {}
