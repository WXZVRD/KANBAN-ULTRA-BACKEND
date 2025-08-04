import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MetricCollector } from '../interface/metric-collector';
import { Task } from '../../project/task';

@Injectable()
export class TasksCreatedPerDayCollector
  implements MetricCollector<{ date: string; count: number }[]>
{
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async collect(projectId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.taskRepo
      .createQueryBuilder('task')
      .select("TO_CHAR(task.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('task.projectId = :projectId', { projectId })
      .andWhere('task.createdAt >= :weekAgo', { weekAgo })
      .groupBy("TO_CHAR(task.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany();
  }
}
