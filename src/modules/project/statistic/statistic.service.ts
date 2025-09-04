import { Injectable } from "@nestjs/common";
import { MemberWorkloadDTO } from "./dto/member-workload.dto";
import { TaskPriorityDTO } from "./dto/task-priority.dto";
import { ColumnStatDTO } from "./dto/column-stat.dto";
import { ProjectProgressDTO } from "./dto/project-progres.dto";
import { StatisticRepository } from "./statistic.repository";

export interface IStatisticService {
  getWorkload(projectId: string): Promise<MemberWorkloadDTO[]>;
  getPriorities(projectId: string): Promise<TaskPriorityDTO[]>;
  getStatuses(projectId: string): Promise<ColumnStatDTO[]>;
  getProgress(projectId: string): Promise<ProjectProgressDTO>;
}

@Injectable()
export class StatisticService implements IStatisticService {
  constructor(private readonly statisticRepository: StatisticRepository) {}

  /**
   * Returns workload per project member.
   * @param projectId - ID of the project
   */
  async getWorkload(projectId: string): Promise<MemberWorkloadDTO[]> {
    return this.statisticRepository.getMembersWorkload(projectId);
  }

  /**
   * Returns the number of tasks grouped by priority.
   * @param projectId - ID of the project
   */
  async getPriorities(projectId: string): Promise<TaskPriorityDTO[]> {
    return this.statisticRepository.getTaskPriorities(projectId);
  }

  /**
   * Returns task counts per status/column.
   * @param projectId - ID of the project
   */
  async getStatuses(projectId: string): Promise<ColumnStatDTO[]> {
    return this.statisticRepository.getColumnStats(projectId);
  }

  /**
   * Returns overall project progress.
   * @param projectId - ID of the project
   */
  async getProgress(projectId: string): Promise<ProjectProgressDTO> {
    return this.statisticRepository.getProjectProgress(projectId);
  }
}
