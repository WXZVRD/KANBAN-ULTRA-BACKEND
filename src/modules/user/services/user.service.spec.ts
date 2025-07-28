import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../repository/user.repository';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Account } from '../../account/entity/account.entity';
import { User } from '../entity/user.entity';
import { UserRole } from '../types/roles.enum';
import { AuthMethod } from '../types/authMethods.enum';
import { NotFoundException } from '@nestjs/common';

const mockAccount: Account = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  type: 'oauth',
  provider: 'google',
  refreshToken: 'mock-refresh-token',
  accessToken: 'mock-access-token',
  expiresAt: Date.now() + 3600,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: undefined as any,
};

const mockUser: User = {
  id: '321e6547-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  password: 'hashed-password',
  displayName: 'Test User',
  picture: 'https://example.com/avatar.png',
  role: UserRole.REGULAR,
  isVerified: true,
  isTwoFactorEnabled: false,
  method: AuthMethod.CREDENTIALS,
  createdAt: new Date(),
  updatedAt: new Date(),
  account: mockAccount,
};

const mockUserRepository = {
  findUniqueById: jest.fn(),
  save: jest.fn(),
};

describe('UserService', (): void => {
  let userService: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async (): Promise<void> => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    userRepository = moduleRef.get(UserRepository);
  });

  describe('update', (): void => {
    const mockValidId: string = '321e6547-e89b-12d3-a456-426614174000';
    const mockInvalidId: string = 'invalid-id';
    const dto: UpdateUserDto = {
      name: 'valid-id',
      email: 'valid-email',
      isTwoFactorEnabled: true,
    };

    it('Should return updated user if user exist', async (): Promise<void> => {
      userRepository.findUniqueById.mockResolvedValue(mockUser);
      userRepository.save.mockResolvedValue({
        ...mockUser,
        ...dto,
      });

      const result: User = await userService.update(mockValidId, dto);

      expect(userRepository.findUniqueById).toHaveBeenCalledWith(mockValidId);
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        ...dto,
      });
      expect(result).toEqual({
        ...mockUser,
        ...dto,
      });
    });

    it('Should throw not found exception if user not exist', async (): Promise<void> => {
      userRepository.findUniqueById.mockResolvedValue(null);

      await expect(userService.update(mockInvalidId, dto)).rejects.toThrow(
        NotFoundException,
      );

      expect(userRepository.findUniqueById).toHaveBeenCalledWith(mockInvalidId);
    });
  });
});
