import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { CreateMembershipDTO } from '../dto/create-membership.dto';
import { Membership } from '../entity/membership.entity';
import { MemberRole } from '../types/member-role.enum';
import { MembershipRepository } from '../repository/membership.repository';

export interface IMembershipService {
  createNewMember(membershipData: CreateMembershipDTO): Promise<any>;
  getProjectMember(
    userId: string,
    projectId: string,
  ): Promise<Membership | null>;
  deleteProjectMember(userId: string, projectId: string): Promise<DeleteResult>;
  updateUserAccess(
    userId: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<Membership>;
}

@Injectable()
export class MembershipService implements IMembershipService {
  public constructor(
    @Inject('IMembershipRepository')
    private readonly membershipRepository: MembershipRepository,
  ) {}

  /**
   * Creates a new member in the project.
   *
   * @param membershipData - DTO containing membership creation data
   */
  public async createNewMember(
    membershipData: CreateMembershipDTO,
  ): Promise<any> {
    await this.membershipRepository.save(membershipData);
  }

  /**
   * Retrieves a specific member in a project.
   *
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Membership or null
   */
  public async getProjectMember(
    userId: string,
    projectId: string,
  ): Promise<Membership | null> {
    return this.membershipRepository.findByUserAndProject(userId, projectId);
  }

  /**
   * Deletes a member from a project.
   *
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns DeleteResult
   */
  public async deleteProjectMember(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.membershipRepository.delete(userId, projectId);
  }

  /**
   * Updates the access level (role) of a project member.
   *
   * @param userId - User ID
   * @param projectId - Project ID
   * @param memberRole - New member role
   * @returns Updated Membership entity
   * @throws NotFoundException if member does not exist
   * @throws ConflictException if role is the same
   */
  public async updateUserAccess(
    userId: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<Membership> {
    const member: Membership | null =
      await this.membershipRepository.findByUserAndProject(userId, projectId);

    if (!member) {
      throw new NotFoundException(
        `Project member with ID ${userId} in project ${projectId} does not exist.`,
      );
    }

    if (member.memberRole === memberRole) {
      throw new ConflictException(
        `User already has role ${memberRole} in this project.`,
      );
    }

    member.memberRole = memberRole;

    return this.membershipRepository.save(member);
  }
}
