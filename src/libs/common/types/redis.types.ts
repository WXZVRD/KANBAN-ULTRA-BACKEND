import { Project } from '../../../modules/project';

export enum RedisKey {
  Project = 'project',
  ProjectAll = 'project:all',
  UserProjects = 'user:projects',
}

export interface RedisValueMap {
  [RedisKey.Project]: Project;
  [RedisKey.ProjectAll]: Project[];
}
