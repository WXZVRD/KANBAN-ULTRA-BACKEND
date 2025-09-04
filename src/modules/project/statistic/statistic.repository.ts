import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Task, TaskPriority } from "../task";
import { ProjectColumn } from "../column";
import { MemberWorkloadDTO } from "./dto/member-workload.dto";
import { TaskPriorityDTO } from "./dto/task-priority.dto";
import { ColumnStatDTO } from "./dto/column-stat.dto";
import { ProjectProgressDTO } from "./dto/project-progres.dto";

export interface IStatisticRepository {
  getMembersWorkload(projectId: string): Promise<MemberWorkloadDTO[]>;
  getTaskPriorities(projectId: string): Promise<TaskPriorityDTO[]>;
  getColumnStats(projectId: string): Promise<ColumnStatDTO[]>;
  getProjectProgress(projectId: string): Promise<ProjectProgressDTO>;
}

@Injectable()
export class StatisticRepository implements IStatisticRepository {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Returns workload statistics for all members in a project.
   * @param projectId - ID of the project
   * @returns Array of objects containing assignee info, task count, and percent of total tasks
   */
  async getMembersWorkload(projectId: string): Promise<MemberWorkloadDTO[]> {
    const totalTasks: number = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId })
      .getCount();

    const result = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder("task")
      .leftJoin("task.assignee", "user")
      .select("task.assigneeId", "assigneeId")
      .addSelect("COUNT(task.id)", "taskCount")
      .addSelect("user.id", "user_id")
      .addSelect("user.picture", "user_picture")
      .addSelect("user.displayName", "user_displayName")
      .where("task.projectId = :projectId", { projectId })
      .groupBy("task.assigneeId")
      .addGroupBy("user.id")
      .addGroupBy("user.picture")
      .addGroupBy("user.displayName")
      .getRawMany<{
        assigneeId: string | null;
        taskCount: string;
        user_id: string | null;
        user_picture: string | null;
        user_displayName: string | null;
      }>();

    return result.map((row) => ({
      assignee: row.assigneeId
        ? {
            id: row.user_id!,
            picture: row.user_picture!,
            displayName: row.user_displayName!,
          }
        : null,
      taskCount: Number(row.taskCount),
      percent: totalTasks > 0 ? (Number(row.taskCount) / totalTasks) * 100 : 0,
    }));
  }

  /**
   * Returns count of tasks grouped by priority in a project.
   * @param projectId - ID of the project
   * @returns Array of objects with priority, count, and percent of total tasks
   */
  async getTaskPriorities(projectId: string): Promise<TaskPriorityDTO[]> {
    const totalTasks: number = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId })
      .getCount();

    const result = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder("task")
      .select("task.priority", "priority")
      .addSelect("COUNT(task.id)", "count")
      .where("task.projectId = :projectId", { projectId })
      .groupBy("task.priority")
      .getRawMany<{ priority: string; count: string }>();

    return result.map((row) => ({
      priority: row.priority as TaskPriority,
      count: Number(row.count),
      percent: totalTasks > 0 ? (Number(row.count) / totalTasks) * 100 : 0,
    }));
  }

  /**
   * Returns count of tasks per project column/status.
   * @param projectId - ID of the project
   * @returns Array of objects with column ID, title, task count, and percent
   */
  async getColumnStats(projectId: string): Promise<ColumnStatDTO[]> {
    const totalTasks: number = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId })
      .getCount();

    const result = await this.dataSource
      .getRepository(ProjectColumn)
      .createQueryBuilder("col")
      .leftJoin("col.tasks", "task")
      .select("col.id", "id")
      .addSelect("col.title", "title")
      .addSelect("COUNT(task.id)", "taskCount")
      .where("col.projectId = :projectId", { projectId })
      .groupBy("col.id")
      .addGroupBy("col.title")
      .orderBy("col.order", "ASC")
      .getRawMany<{ id: string; title: string; taskCount: string }>();

    return result.map((row) => ({
      columnId: row.id,
      title: row.title,
      taskCount: Number(row.taskCount),
      percent: totalTasks > 0 ? (Number(row.taskCount) / totalTasks) * 100 : 0,
    }));
  }

  /**
   * Returns overall project progress.
   * @param projectId - ID of the project
   * @returns Object containing total tasks, done tasks, and completion percent
   */
  async getProjectProgress(projectId: string): Promise<ProjectProgressDTO> {
    const totalTasks: number = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder("task")
      .where("task.projectId = :projectId", { projectId })
      .getCount();

    const doneTasks: number = await this.dataSource
      .getRepository(Task)
      .createQueryBuilder("task")
      .innerJoin("task.column", "col")
      .where("task.projectId = :projectId", { projectId })
      .andWhere("col.title = :done", { done: "Done" })
      .getCount();

    return {
      totalTasks,
      doneTasks,
      percent: totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0,
    };
  }
}
