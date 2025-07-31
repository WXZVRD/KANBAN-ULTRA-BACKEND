import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IS_DEV_ENV } from './libs/common/utils/isDev.util';
import { DatabaseModule } from './modules/database/database.module';
import { UserModule } from './modules/user/user.module';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { EmailConfirmationModule } from './modules/auth/email-confirmation/email-confirmation.module';
import { PasswordRecoveryModule } from './modules/password-recovery/password-recovery.module';
import { TwoFactorAuthModule } from './modules/auth/two-factor-auth/two-factor-auth.module';
import { ProjectModule } from './modules/project/project.module';
import { TokenModule } from './modules/token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: !IS_DEV_ENV,
    }),
    DatabaseModule,
    UserModule,
    AccountModule,
    AuthModule,
    MailModule,
    EmailConfirmationModule,
    PasswordRecoveryModule,
    TwoFactorAuthModule,
    ProjectModule,
    TokenModule,
  ],
})
export class AppModule {}
