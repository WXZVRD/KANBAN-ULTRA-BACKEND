import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Membership } from '../entity/membership.entity';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';

interface IMembershipRepository {
  create(memberToCreate: DeepPartial<Membership>): Promise<Membership>;
  save(memberToSave: DeepPartial<Membership>): Promise<Membership>;
  createAndSave(memberToSave: DeepPartial<Membership>): Promise<Membership>;
  findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Membership | null>;
  delete(userId: string, projectId: string): Promise<DeleteResult>;
  updateUserAccess(userId: string, projectId: string): Promise<DeleteResult>;
}

@Injectable()
export class MembershipRepository implements IMembershipRepository {
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

  public async delete(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.repo.delete({ userId: userId, projectId: projectId });
  }

  public async updateUserAccess(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.repo.delete({ userId: userId, projectId: projectId });
  }
}
