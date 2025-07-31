import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TokenType } from '../../account/types/token.types';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: TokenType,
    default: TokenType.VERIFICATION,
  })
  type: TokenType;

  @Column()
  expiresIn: Date;

  @CreateDateColumn()
  createdAt: Date;
}
