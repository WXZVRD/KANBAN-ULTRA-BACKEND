import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Membership } from "../entity/membership.entity";
import { DeepPartial, DeleteResult, In, Repository } from "typeorm";

export interface IMembershipRepository {
  create(memberToCreate: DeepPartial<Membership>): Promise<Membership>;
  save(memberToSave: DeepPartial<Membership>): Promise<Membership>;
  createAndSave(memberToSave: DeepPartial<Membership>): Promise<Membership>;
  findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Membership | null>;
  delete(userId: string, projectId: string): Promise<DeleteResult>;
  deleteArrayOfMembers(ids: string[], projectId: string): Promise<DeleteResult>;
  updateUserAccess(userId: string, projectId: string): Promise<DeleteResult>;
  getProjectsByMember(userId: string): Promise<Membership[] | null>;
}

@Injectable()
export class MembershipRepository implements IMembershipRepository {
  public constructor(
    @InjectRepository(Membership)
    private readonly repo: Repository<Membership>,
  ) {}

  /**
   * Creates a Membership entity (does not persist to DB).
   * @param memberToCreate - Partial membership data
   * @returns Membership instance
   */
  public async create(
    memberToCreate: DeepPartial<Membership>,
  ): Promise<Membership> {
    return this.repo.create(memberToCreate);
  }

  /**
   * Saves a Membership entity to the database.
   * @param memberToSave - Membership entity or partial data
   * @returns Saved Membership entity
   */
  public async save(
    memberToSave: DeepPartial<Membership>,
  ): Promise<Membership> {
    return this.repo.save(memberToSave);
  }

  /**
   * Creates and immediately saves a Membership entity.
   * @param memberToSave - Membership entity or partial data
   * @returns Saved Membership entity
   */
  public async createAndSave(
    memberToSave: DeepPartial<Membership>,
  ): Promise<Membership> {
    const createdMember: Membership = this.repo.create(memberToSave);
    return this.repo.save(createdMember);
  }

  /**
   * Finds a membership by user ID and project ID.
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns Membership entity or null
   */
  public async findByUserAndProject(
    userId: string,
    projectId: string,
  ): Promise<Membership | null> {
    return this.repo.findOne({ where: { userId, projectId } });
  }

  /**
   * Finds all members for a specific project.
   * @param projectId - Project ID
   * @returns Array of Memberships or null
   */
  public async findByProject(projectId: string): Promise<Membership[] | null> {
    return this.repo.find({ where: { projectId }, relations: ["user"] });
  }

  /**
   * Deletes a single member from a project.
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns DeleteResult from TypeORM
   */
  public async delete(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.repo.delete({ userId: userId, projectId: projectId });
  }

  /**
   * Deletes multiple members from a project.
   * @param ids - Array of Membership IDs
   * @param projectId - Project ID
   * @returns DeleteResult from TypeORM
   */
  public async deleteArrayOfMembers(
    ids: string[],
    projectId: string,
  ): Promise<DeleteResult> {
    return this.repo.delete({
      id: In(ids),
      projectId: projectId,
    });
  }

  /**
   * Updates a user's access to a project.
   * @param userId - User ID
   * @param projectId - Project ID
   * @returns DeleteResult (currently this method performs delete)
   */
  public async updateUserAccess(
    userId: string,
    projectId: string,
  ): Promise<DeleteResult> {
    return this.repo.delete({ userId: userId, projectId: projectId });
  }

  /**
   * Retrieves all projects for a given member.
   * @param userId - User ID
   * @returns Array of Memberships with project relations or null
   */
  public async getProjectsByMember(
    userId: string,
  ): Promise<Membership[] | null> {
    return this.repo.find({
      where: { userId: userId },
      relations: ["project"],
    });
  }
}
