import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Membership } from "../entity/membership.entity";
import { DeepPartial, DeleteResult, Repository } from "typeorm";

export interface IMembershipRepository {
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

  /** Creates a Membership entity (does not persist to DB). */
  public async create(
    memberToCreate: DeepPartial<Membership>,
  ): Promise<Membership> {
    return this.repo.create(memberToCreate);
  }

  /** Saves a Membership entity to the database. */
  public async save(
    memberToSave: DeepPartial<Membership>,
  ): Promise<Membership> {
    return this.repo.save(memberToSave);
  }

  /** Creates and immediately saves a Membership entity. */
  public async createAndSave(
    memberToSave: DeepPartial<Membership>,
  ): Promise<Membership> {
    const createdMember: Membership = this.repo.create(memberToSave);
    return this.repo.save(createdMember);
  }

  /** Finds a member by user ID and project ID. */
  public async findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Membership | null> {
    return this.repo.findOne({ where: { userId, projectId } });
  }

  /** Finds a member by project ID. */
  public async findByProject(projectId: string): Promise<Membership[] | null> {
    return this.repo.find({ where: { projectId }, relations: ["user"] });
  }

  /** Deletes a member from a project. */
  public async delete(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.repo.delete({ userId: userId, projectId: projectId });
  }

  /** Dummy method for updating user access (currently performs delete). */
  public async updateUserAccess(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.repo.delete({ userId: userId, projectId: projectId });
  }
}
