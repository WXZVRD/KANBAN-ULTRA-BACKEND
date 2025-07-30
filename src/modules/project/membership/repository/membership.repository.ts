import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '../entity/membership.entity';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class MembershipRepository {
  public constructor(
    @InjectRepository(Membership)
    private readonly repo: Repository<Membership>,
  ) {}

  public async create(
    memberToCreate: DeepPartial<Membership>,
  ): Promise<Membership> {
    return this.repo.create(memberToCreate);
  }

  public async save(
    memberToSave: DeepPartial<Membership>,
  ): Promise<Membership> {
    return this.repo.save(memberToSave);
  }

  public async createAndSave(
    memberToSave: DeepPartial<Membership>,
  ): Promise<Membership> {
    const createdMember: Membership = this.repo.create(memberToSave);

    return this.repo.save(createdMember);
  }

  public async findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Membership | null> {
    return this.repo.findOne({ where: { userId, projectId } });
  }
}
