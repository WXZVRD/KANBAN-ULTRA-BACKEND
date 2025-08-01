import { v4 as uuidv4 } from 'uuid';
import { ITokenGenerator } from '../types/interfaces/token-generator.interface';

export class UuidTokenGenerator implements ITokenGenerator {
  generate(): string {
    return uuidv4();
  }
}
