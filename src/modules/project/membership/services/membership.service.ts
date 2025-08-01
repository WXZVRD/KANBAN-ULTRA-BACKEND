import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembershipRepository } from '../repository/membership.repository';
import { CreateMembershipDTO } from '../dto/create-membership.dto';
import { Membership } from '../entity/membership.entity';
import { DeleteResult } from 'typeorm';
import { AccessType } from '../../types/access.enum';
import { MemberRole } from '../types/member-role.enum';

interface IMembershipService {
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
    private readonly membershipRepository: MembershipRepository,
  ) {}

  public async createNewMember(
    membershipData: CreateMembershipDTO,
  ): Promise<any> {
    await this.membershipRepository.save(membershipData);
  }

  public async getProjectMember(
    userId: string,
    projectId: string,
  ): Promise<Membership | null> {
    return this.membershipRepository.findByUserAndProject(userId, projectId);
  }

  public async deleteProjectMember(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.membershipRepository.delete(userId, projectId);
  }

  public async updateUserAccess(
    userId: string,
    projectId: string,
    memberRole: MemberRole,
  ): Promise<Membership> {
    const member: Membership | null =
      await this.membershipRepository.findByUserAndProject(userId, projectId);

    if (!member) {
      throw new NotFoundException(
        `Участника проекта с id ${userId} в проекте: ${projectId} не существует.`,
      );
    }

    if (member.memberRole === memberRole) {
      throw new ConflictException(
        `Пользователь уже имеет роль ${memberRole} в проекте`,
      );
    }

    member.memberRole = memberRole;

    return this.membershipRepository.save(member);
  }
}
