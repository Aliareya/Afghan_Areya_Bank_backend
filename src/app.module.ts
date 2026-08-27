import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { MailModule } from './mail/mail.module';
import { AccountModule } from './api/account/account.module';
import { TransactionsModule } from './api/transactions/transactions.module';
import pg from 'pg';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    // config datrabase connection
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        return configService.getOrThrow<TypeOrmModuleOptions>('database');
      },
    }),
    AuthModule,
    UsersModule,
    MailModule,
    AccountModule,
    TransactionsModule,
    // All application modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
