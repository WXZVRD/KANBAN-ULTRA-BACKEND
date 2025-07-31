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
import { ProjectColumnService } from './column.service';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { CreateColumnDTO } from './dto/create-column.dto';
import { MembershipAccessControlGuard } from '../membership/guards/member-access-control.guard';
import { MembershipRoles } from '../membership/decorators/membership.decorator';
import { MemberRole } from '../membership/types/member-role.enum';
import { ProjectColumn } from './entity/column.entity';
import { UpdateColumnDTO } from './dto/update-column.dto';
import { MoveColumnDTO } from './dto/move-column.dto';
import { DeleteResult } from 'typeorm';

@Controller('project/:projectId/project_column')
export class ProjectColumnController {
  constructor(private readonly projectColumnService: ProjectColumnService) {}

  @Post('newOne')
  @Authorization()
  public async newOne(@Body() dto: CreateColumnDTO): Promise<any> {
    return this.projectColumnService.createNewColumn(dto);
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Get(':projectId')
  @Authorization()
  public async getByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<ProjectColumn[]> {
    return this.projectColumnService.findByProjectId(projectId);
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId')
  @Authorization()
  public async update(
    @Param('columnId') columnId: string,
    @Body() dto: UpdateColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.update(columnId, dto);
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Patch(':columnId/move-column')
  @Authorization()
  public async moveColumn(
    @Param('columnId') columnId: string,
    @Body() dto: MoveColumnDTO,
  ): Promise<ProjectColumn> {
    return this.projectColumnService.moveColumn(columnId, dto);
  }

  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN, MemberRole.VISITOR)
  @Delete(':columnId')
  @Authorization()
  public async deleteColumn(
    @Param('columnId') columnId: string,
  ): Promise<DeleteResult> {
    return this.projectColumnService.delete(columnId);
  }
}
