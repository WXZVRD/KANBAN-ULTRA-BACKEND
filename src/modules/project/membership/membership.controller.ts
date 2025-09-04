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
   * Sends a membership invitation to a user via email.
   * @param dto - Invitation DTO containing email and memberRole
   * @param projectId - ID of the project
   * @returns true if invitation sent successfully
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
   * Accepts an invitation using the provided token and creates the membership.
   * @param projectId - ID of the project
   * @param dto - Invite DTO containing token and memberRole
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
   * Deletes a single project member.
   * @param projectId - ID of the project
   * @param userId - ID of the member to delete
   * @returns DeleteResult from TypeORM
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
   * Deletes multiple project members at once.
   * @param projectId - ID of the project
   * @param dto - DTO containing array of member IDs
   * @returns DeleteResult from TypeORM
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
   * @param projectId - ID of the project
   * @param dto - DTO containing userId and new memberRole
   * @returns Updated Membership entity
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

  /**
   * Retrieves all projects for a specific member.
   * @param userId - ID of the user
   * @returns Array of Memberships or null
   */
  @Authorization()
  @Get("/get-project-by-member")
  @HttpCode(HttpStatus.OK)
  @ApiAuthEndpoint(MembershipMapSwagger.getProjectByMember)
  public async getProjectByMember(
    @Authorized("id") userId: string,
  ): Promise<Membership[] | null> {
    return this.membershipService.getProjectsByMember(userId);
  }

  /**
   * Retrieves all members of a specific project.
   * @param projectId - ID of the project
   * @returns Array of Memberships or null
   */
  @Get("/project-member")
  public async getProjectMembers(
    @Param("projectId") projectId: string,
  ): Promise<Membership[] | null> {
    return this.membershipService.getAllProjectMembers(projectId);
  }
}
