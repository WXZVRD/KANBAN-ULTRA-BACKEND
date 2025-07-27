import { AccountService } from './account.service';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountRepository } from './repositories/account.repository';
import { User } from '../user/entity/user.entity';
import { Account } from './entity/account.entity';
import { UserRole } from '../user/types/roles.enum';
import { AuthMethod } from '../user/types/authMethods.enum';

describe('AccountService', (): void => {
  let accountService: AccountService;
  let accountRepository: jest.Mocked<AccountRepository>;

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

  beforeEach(async (): Promise<void> => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: {
            create: jest.fn(),
            findByIdAndProvider: jest.fn(),
          },
        },
      ],
    }).compile();

    accountService = moduleRef.get<AccountService>(AccountService);
    accountRepository = moduleRef.get(AccountRepository);
  });

  describe('create', (): void => {
    it('Should return account entity', async (): Promise<void> => {
      accountRepository.create.mockResolvedValue(mockAccount);

      const result: Account = await accountService.create(
        mockUser,
        'oauth',
        'google',
        'access-token',
        'refresh-token',
        3600,
      );

      expect(accountRepository.create).toHaveBeenCalledWith(
        mockUser,
        'oauth',
        'google',
        'access-token',
        'refresh-token',
        3600,
      );

      expect(result).toBe(mockAccount);
    });
  });

  describe('findByIdAndProvider', (): void => {
    it('Should return account entity by ID and Provider', async (): Promise<void> => {
      accountRepository.findByIdAndProvider.mockResolvedValue(mockAccount);

      const result: Account | null = await accountService.findByIdAndProvider(
        mockAccount.id,
        AuthMethod.GOOGLE,
      );

      expect(accountRepository.findByIdAndProvider).toHaveBeenCalledWith(
        mockAccount.id,
        AuthMethod.GOOGLE,
      );
      expect(result).toBe(mockAccount);
    });

    it('should return null when account not found', async (): Promise<void> => {
      accountRepository.findByIdAndProvider.mockResolvedValue(null);

      const result: Account | null = await accountService.findByIdAndProvider(
        '2',
        'github',
      );

      expect(result).toBeNull();
    });
  });
});
