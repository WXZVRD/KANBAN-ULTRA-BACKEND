import { Module } from "@nestjs/common";
import { StatisticController } from "./statistic.controller";
import { StatisticService } from "./statistic.service";
import { StatisticRepository } from "./statistic.repository";

@Module({
  imports: [],
  controllers: [StatisticController],
  providers: [StatisticService, StatisticRepository],
})
export class StatisticModule {}
