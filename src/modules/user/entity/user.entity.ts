import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../account/entity/account.entity';
import { UserRole } from '../types/roles.enum';
import { AuthMethod } from '../types/authMethods.enum';
import { Project } from '../../project/entity/project.entity';
import { Task } from '../../project/task/entity/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, unique: false })
  password: string;

  @Column({ nullable: true, unique: false })
  displayName: string;

  @Column({ nullable: true, unique: false })
  picture: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.REGULAR,
  })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({
    type: 'enum',
    enum: AuthMethod,
    default: AuthMethod.CREDENTIALS,
  })
  method: AuthMethod;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Account, { cascade: true, eager: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @OneToMany(() => Task, (task) => task.author)
  tasks: Task[];

  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];
}
