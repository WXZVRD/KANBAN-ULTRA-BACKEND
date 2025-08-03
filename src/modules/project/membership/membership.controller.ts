import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
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
import { MembershipService } from './services/membership.service';
import { MembershipInvitationService } from './services/membership-invitation.service';
import { MembershipAccessControlGuard } from './guards/member-access-control.guard';
import { MemberRole } from './types/member-role.enum';
import { MembershipRoles } from './decorators/membership.decorator';
import { Authorization } from '../../auth/decorators/auth.decorator';
import { SendInviteDTO } from './dto/send-invite.dto';
import { InviteDto } from './dto/invite.dto';
import { UpdateMembershipDTO } from './dto/update-member-role.dto';
import { Membership } from './entity/membership.entity';
import { ApiAuthEndpoint } from '../../../libs/common/decorators/api-swagger-simpli.decorator';
import { MembershipMapSwagger } from './maps/membership-map.swagger';

@ApiTags('Memberships')
@ApiBearerAuth()
@Controller('project/:projectId/membership')
export class MembershipController {
  constructor(
    private readonly membershipService: MembershipService,
    private readonly membershipInvitationService: MembershipInvitationService,
  ) {}

  /**
   * Sends a project membership invitation to a user.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiAuthEndpoint(MembershipMapSwagger.inviteUser)
  public async inviteUser(
    @Body() dto: SendInviteDTO,
    @Param('projectId') projectId: string,
  ): Promise<boolean> {
    return this.membershipInvitationService.sendVerificationToken(
      dto.email,
      projectId,
      dto.memberRole,
    );
  }

  /**
   * Accepts an invitation by validating the token and creating the membership.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post('/take-invite')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiAuthEndpoint(MembershipMapSwagger.newVerification)
  public async newVerification(
    @Req() req: Request,
    @Body() dto: InviteDto,
  ): Promise<void> {
    return this.membershipInvitationService.newVerification(dto);
  }

  /**
   * Deletes a project member.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Delete('/:userId')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiAuthEndpoint(MembershipMapSwagger.deleteMember)
  public async deleteMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<DeleteResult> {
    return this.membershipService.deleteProjectMember(userId, projectId);
  }

  /**
   * Updates the role of a project member.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Patch('/update-member')
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiAuthEndpoint(MembershipMapSwagger.updateMemberRole)
  public async updateMemberRole(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateMembershipDTO,
  ): Promise<Membership> {
    return this.membershipService.updateUserAccess(
      dto.userId,
      projectId,
      dto.memberRole,
    );
  }
}
