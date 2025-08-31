import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { DeleteResult } from "typeorm";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { IMembershipService } from "./services/membership.service";
import { IMembershipInvitationService } from "./services/membership-invitation.service";
import { ApiAuthEndpoint } from "../../../libs/common/decorators/api-swagger-simpli.decorator";
import { Authorization, Authorized } from "../../auth";
import {
  InviteDto,
  MemberACL,
  MemberRole,
  Membership,
  MembershipAccessControlGuard,
  MembershipMapSwagger,
  MembershipRoles,
  SendInviteDTO,
  UpdateMembershipDTO,
} from "./index";
import { DeleteMembersDTO } from "./dto/delete-members.dto";

@ApiTags("Memberships")
@ApiBearerAuth()
@Controller("project/:projectId/membership")
export class MembershipController {
  constructor(
    @Inject("IMembershipService")
    private readonly membershipService: IMembershipService,
    @Inject("IMembershipInvitationService")
    private readonly membershipInvitationService: IMembershipInvitationService,
  ) {}

  /**
   * Sends a project membership invitation to a user.
   */
  @UseGuards(MembershipAccessControlGuard)
  @MembershipRoles(MemberRole.ADMIN)
  @Post("/invite")
  @HttpCode(HttpStatus.OK)
  @Authorization()
  @ApiAuthEndpoint(MembershipMapSwagger.inviteUser)
  public async inviteUser(
    @Body() dto: SendInviteDTO,
    @Param("projectId") projectId: string,
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
  @Authorization()
  @Post("/take-invite")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(MembershipMapSwagger.newVerification)
  public async newVerification(
    @Param("projectId") projectId: string,
    @Body() dto: InviteDto,
  ): Promise<void> {
    return this.membershipInvitationService.newVerification({
      token: dto.token,
      projectId: projectId,
      memberRole: dto.memberRole,
    });
  }

  /**
   * Deletes a project member.
   */
  @MemberACL(MemberRole.ADMIN)
  @Authorization()
  @Delete("/:userId")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(MembershipMapSwagger.deleteMember)
  public async deleteMember(
    @Param("projectId") projectId: string,
    @Param("userId") userId: string,
  ): Promise<DeleteResult> {
    return this.membershipService.deleteProjectMember(userId, projectId);
  }

  /**
   * Deletes an array of project members.
   */
  @MemberACL(MemberRole.ADMIN)
  @Authorization()
  @Delete("/members/all")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(MembershipMapSwagger.deleteArrayOfMembers)
  public async deleteArrayOfMembers(
    @Param("projectId") projectId: string,
    @Body() dto: DeleteMembersDTO,
  ): Promise<DeleteResult> {
    return this.membershipService.deleteArrayOfProjectMember(
      dto.ids,
      projectId,
    );
  }

  /**
   * Updates the role of a project member.
   */
  @MemberACL(MemberRole.ADMIN)
  @Authorization()
  @Patch("/update-member")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(MembershipMapSwagger.updateMemberRole)
  public async updateMemberRole(
    @Param("projectId") projectId: string,
    @Body() dto: UpdateMembershipDTO,
  ): Promise<Membership> {
    return this.membershipService.updateUserAccess(
      dto.userId,
      projectId,
      dto.memberRole,
    );
  }

  @Authorization()
  @Get("/get-project-by-member")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(MembershipMapSwagger.getProjectByMember)
  public async getProjectByMember(
    @Authorized("id") userId: string,
  ): Promise<Membership[] | null> {
    return this.membershipService.getProjectsByMember(userId);
  }

  @Get("/project-member")
  public async getProjectMembers(
    @Param("projectId") projectId: string,
  ): Promise<Membership[] | null> {
    return this.membershipService.getAllProjectMembers(projectId);
  }
}
