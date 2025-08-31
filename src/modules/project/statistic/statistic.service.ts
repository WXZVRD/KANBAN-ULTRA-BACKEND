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

  async getWorkload(projectId: string): Promise<MemberWorkloadDTO[]> {
    return this.statisticRepository.getMembersWorkload(projectId);
  }

  async getPriorities(projectId: string): Promise<TaskPriorityDTO[]> {
    return this.statisticRepository.getTaskPriorities(projectId);
  }

  async getStatuses(projectId: string): Promise<ColumnStatDTO[]> {
    return this.statisticRepository.getColumnStats(projectId);
  }

  async getProgress(projectId: string): Promise<ProjectProgressDTO> {
    return this.statisticRepository.getProjectProgress(projectId);
  }
}
