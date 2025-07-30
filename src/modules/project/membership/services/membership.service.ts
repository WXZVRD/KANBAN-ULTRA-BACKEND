import { Injectable } from '@nestjs/common';
import { MembershipRepository } from '../repository/membership.repository';
import { CreateMembershipDTO } from '../dto/create-membership.dto';

@Injectable()
export class MembershipService {
  public constructor(
    private readonly membershipRepository: MembershipRepository,
  ) {}

  public async createNewMember(
    membershipData: CreateMembershipDTO,
  ): Promise<any> {
    await this.membershipRepository.save(membershipData);
  }
}
