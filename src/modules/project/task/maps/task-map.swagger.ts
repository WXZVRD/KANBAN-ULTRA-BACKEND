import { DeleteResult } from 'typeorm';
import { Task } from '../entity/task.entity';
import { CreateTaskDTO } from '../dto/create-task.dto';
import { UpdateTaskDTO } from '../dto/update-task.dto';
import { SwaggerMap } from '../../../../libs/common/types/swagger-map.type';
import { TaskController } from '../task.controller';

export const TaskMapSwagger: SwaggerMap<TaskController> = {
  create: {
    summary: 'Create a new task in a project',
    okDescription: 'Task successfully created',
    okType: Task,
    bodyType: CreateTaskDTO,
  },

  update: {
    summary: 'Update task by DTO',
    okDescription: 'Task successfully updated',
    okType: Task,
    bodyType: UpdateTaskDTO,
  },

  getAll: {
    summary: 'Get all tasks',
    okDescription: 'List of all tasks',
    okType: [Task],
  },

  getById: {
    summary: 'Get task by ID',
    okDescription: 'Task found',
    okType: Task,
  },

  getTasksByProjectId: {
    summary: 'Get tasks by project ID with filters',
    okDescription: 'List of project tasks',
    okType: [Task],
  },

  deleteTask: {
    summary: 'Delete task by ID',
    okDescription: 'Task successfully deleted',
    okType: DeleteResult,
  },
};
