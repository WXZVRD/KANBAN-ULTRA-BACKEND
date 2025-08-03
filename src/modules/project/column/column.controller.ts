import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectColumnService } from './column.service';
import { ProjectColumn } from './entity/column.entity';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { CreateColumnDTO } from './dto/create-column.dto';
import { MembershipAccessControlGuard } from '../membership/guards/member-access-control.guard';
import { MemberRole } from '../membership/types/member-role.enum';
import { MembershipRoles } from '../membership/decorators/membership.decorator';
import { UpdateColumnDTO } from './dto/update-column.dto';
import { MoveColumnDTO } from './dto/move-column.dto';
import { ApiAuthEndpoint } from '../../../libs/common/decorators/api-swagger-simpli.decorator';
import { ColumnMapSwagger } from './maps/project-map.swagger';

@ApiTags('Project Columns')
@ApiBearerAuth()
@Controller('project/:projectId/project_column')
export class ProjectColumnController {
  constructor(private readonly projectColumnService: ProjectColumnService) {}

  /**
   * Creates a new project column.
   */
  @Post('newOne')
  @Authorization()
  @ApiAuthEndpoint(ColumnMapSwagger.newOne)
  public async newOne(@Body() dto: CreateColumnDTO): Promise<any> {
    return this.projectColumnService.createNewColumn(dto);
  }

  /**
   * Retrieves all columns for a specific project.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Get(':projectId')
  @Authorization()
  @ApiAuthEndpoint(ColumnMapSwagger.getByProjectId)
  public async getByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<ProjectColumn[]> {
    return this.projectColumnService.findByProjectId(projectId);
  }

  /**
   * Updates an existing project column.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId')
  @Authorization()
  @ApiAuthEndpoint(ColumnMapSwagger.update)
  public async update(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.update(columnId, dto);
  }

  /**
   * Moves a column to a new order in the project.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId/move-column')
  @Authorization()
  @ApiAuthEndpoint(ColumnMapSwagger.moveColumn)
  public async moveColumn(
    @Param('columnId') columnId: string,
    @Body() dto: MoveColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.moveColumn(columnId, dto);
  }

  /**
   * Deletes a project column by its ID.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Delete(':columnId')
  @Authorization()
  @ApiAuthEndpoint(ColumnMapSwagger.deleteColumn)
  public async deleteColumn(
    @Param('columnId') columnId: string,
  ): Promise<DeleteResult> {
    return this.projectColumnService.delete(columnId);
  }
}
