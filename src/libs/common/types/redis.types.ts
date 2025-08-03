import { Project } from '../../../modules/project';

export enum RedisKey {
  // Projects
  Project = 'project',
  ProjectAll = 'project:all',
}

export interface RedisValueMap {
  [RedisKey.Project]: Project;
  [RedisKey.ProjectAll]: Project[];
}
