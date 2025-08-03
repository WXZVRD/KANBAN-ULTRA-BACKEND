import { Project } from '../../../modules/project';
import { Task } from '../../../modules/project/task';

export enum RedisKey {
  // Projects
  Project = 'project',
  ProjectAll = 'project:all',

  // Tasks
  Task = 'task',
  TaskAll = 'task:all',
  ProjectTasks = 'project:tasks',
}

export interface RedisValueMap {
  // Projects
  [RedisKey.Project]: Project;
  [RedisKey.ProjectAll]: Project[];

  // Tasks
  [RedisKey.Task]: Task;
  [RedisKey.TaskAll]: Task[];
  [RedisKey.ProjectTasks]: Task[];
}
