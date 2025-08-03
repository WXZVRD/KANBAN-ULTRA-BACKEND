import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TaskService } from './service/task.service';
import { ApiAuthEndpoint } from '../../../libs/common/decorators/api-swagger-simpli.decorator';
import { MemberACL, MemberRole } from '../membership';
import {
  CreateTaskDTO,
  Task,
  TaskFilterDto,
  TaskMapSwagger,
  UpdateTaskDTO,
} from './index';
import { Authorization, Authorized } from '../../auth';
import { UpdateAssigneeDTO } from './dto/update-assignee.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('project/:projectId/task')
export class TaskController {
  private readonly logger: Logger = new Logger(TaskController.name);

  constructor(private readonly taskService: TaskService) {}

  /**
   * Creates a new task for the specified project.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER)
  @Authorization()
  @Post('create')
  @ApiAuthEndpoint(TaskMapSwagger.create)
  public async create(
    @Body() dto: CreateTaskDTO,
    @Authorized('id') id: string,
  ): Promise<Task> {
    this.logger.log(`POST /create | UserId=${id} | DTO=${JSON.stringify(dto)}`);
    const task: Task = await this.taskService.create(dto, id);
    this.logger.log(`Task created with ID=${task.id}`);
    return task;
  }

  /**
   * Updates an existing task.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER)
  @Authorization()
  @Patch('update')
  @ApiAuthEndpoint(TaskMapSwagger.update)
  public async update(@Body() dto: UpdateTaskDTO): Promise<Task> {
    this.logger.log(`PATCH /update | DTO=${JSON.stringify(dto)}`);
    const task: Task = await this.taskService.update(dto);
    this.logger.log(`Task updated ID=${task.id}`);
    return task;
  }

  /**
   * Updates the assignee of a specific task.
   *
   * @description
   * Changes the assignee of a task to another user.
   * Only members with `ADMIN` or `MEMBER` roles are allowed.
   *
   * @param assigneeId - The ID of the new assignee
   * @param dto - DTO containing the task ID and additional data
   * @returns The updated `Task` entity
   *
   * @throws NotFoundException if the task does not exist
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER)
  @Authorization()
  @Patch('update-assignee/:assigneeId')
  @ApiAuthEndpoint(TaskMapSwagger.updateAssignee)
  public async updateAssignee(
    @Param('assigneeId') assigneeId: string,
    @Body() dto: UpdateAssigneeDTO,
  ): Promise<Task> {
    this.logger.log(
      `Received request to update assignee for task ID: ${dto.taskId} → new assignee: ${assigneeId}`,
    );

    const updatedTask: Task = await this.taskService.updateAssignee(
      assigneeId,
      dto,
    );

    this.logger.log(
      `Task ${updatedTask.id} successfully reassigned to user ${assigneeId}`,
    );

    return updatedTask;
  }

  /**
   * Retrieves all tasks.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Authorization()
  @Post('getAll')
  @ApiAuthEndpoint(TaskMapSwagger.getAll)
  public async getAll(): Promise<Task[]> {
    this.logger.log('POST /getAll | Fetching all tasks');
    const tasks: Task[] = await this.taskService.getAll();
    this.logger.log(`Returned ${tasks.length} tasks`);
    return tasks;
  }

  /**
   * Retrieves a task by its ID.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Authorization()
  @Post('getById')
  @ApiAuthEndpoint(TaskMapSwagger.getById)
  public async getById(@Param('id') id: string): Promise<Task> {
    this.logger.log(`POST /getById | TaskID=${id}`);
    const task: Task = await this.taskService.getById(id);
    this.logger.log(`Returned task: ${task?.id || 'NOT FOUND'}`);
    return task;
  }

  /**
   * Retrieves all tasks for a specific project with optional filters.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.VISITOR)
  @Authorization()
  @Get('getByProjectId')
  @ApiAuthEndpoint(TaskMapSwagger.getTasksByProjectId)
  public async getTasksByProjectId(
    @Param('projectId') projectId: string,
    @Query() filter: TaskFilterDto,
  ): Promise<Task[]> {
    this.logger.log(
      `GET /getByProjectId | ProjectID=${projectId} | Filter=${JSON.stringify(filter)}`,
    );
    const tasks: Task[] = await this.taskService.findProjectTask(
      projectId,
      filter,
    );
    this.logger.log(
      `Returned ${tasks.length} tasks for ProjectID=${projectId}`,
    );
    return tasks;
  }

  /**
   * Deletes a task by its ID.
   */
  @MemberACL(MemberRole.ADMIN, MemberRole.MEMBER)
  @Authorization()
  @Delete('/:taskId')
  @ApiAuthEndpoint(TaskMapSwagger.deleteTask)
  public async deleteTask(
    @Param('taskId') taskId: string,
  ): Promise<DeleteResult> {
    this.logger.log(`DELETE /:taskId | TaskID=${taskId}`);
    const res: DeleteResult = await this.taskService.delete(taskId);

    return res;
  }
}
