import { ITokenGenerator } from '../types/interfaces/token-generator.interface';

export class NumericTokenGenerator implements ITokenGenerator {
  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
