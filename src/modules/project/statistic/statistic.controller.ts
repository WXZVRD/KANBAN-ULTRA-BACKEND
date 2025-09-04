import { Controller, Get, Param } from "@nestjs/common";
import { StatisticService } from "./statistic.service";

@Controller("project/:projectId/statistic")
export class StatisticController {
  constructor(private readonly statsService: StatisticService) {}

  /**
   * Retrieves all project statistics.
   *
   * @param projectId - ID of the project
   * @returns An object containing:
   *  - workload: number of tasks per user
   *  - priorities: count of tasks per priority
   *  - statuses: count of tasks per status
   *  - progress: task progress overview
   */
  @Get()
  public async getAllStat(@Param("projectId") projectId: string): Promise<any> {
    const [workload, priorities, statuses, progress] = await Promise.all([
      this.statsService.getWorkload(projectId),
      this.statsService.getPriorities(projectId),
      this.statsService.getStatuses(projectId),
      this.statsService.getProgress(projectId),
    ]);

    return { workload, priorities, statuses, progress };
  }
}
