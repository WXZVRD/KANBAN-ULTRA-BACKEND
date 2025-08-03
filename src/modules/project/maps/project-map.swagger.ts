import { DeleteResult } from 'typeorm';
import { Project } from '../entity/project.entity';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDTO } from '../dto/update-project.dto';
import { SwaggerMap } from '../../../libs/common/types/swagger-map.type';
import { ProjectController } from '../project.controller';
import { UpdateAssigneeDTO } from '../task/dto/update-assignee.dto';
import { Task } from '../task';

export const ProjectMapSwagger: SwaggerMap<ProjectController> = {
  create: {
    summary: 'Create a new project',
    okDescription: 'Project successfully created',
    okType: Project,
    bodyType: CreateProjectDto,
  },

  getAll: {
    summary: 'Get all projects (Admin only)',
    okDescription: 'List of all projects',
    okType: [Project],
  },

  getByUser: {
    summary: 'Get all projects of the current user',
    okDescription: 'List of user projects',
    okType: [Project],
  },

  getById: {
    summary: 'Get project by ID',
    okDescription: 'Project found',
    okType: Project,
  },

  updateProject: {
    summary: 'Update project by ID',
    okDescription: 'Project successfully updated',
    okType: Project,
    bodyType: UpdateProjectDTO,
  },

  delete: {
    summary: 'Delete project by ID',
    okDescription: 'Project successfully deleted',
    okType: DeleteResult,
  },
};
