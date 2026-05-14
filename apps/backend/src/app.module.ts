import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { EngineersModule } from './engineers/engineers.module'
import { ClientsModule } from './clients/clients.module'
import { JobsModule } from './jobs/jobs.module'
import { ProposalsModule } from './proposals/proposals.module'
import { ContractsModule } from './contracts/contracts.module'
import { PaymentsModule } from './payments/payments.module'
import { MessagesModule } from './messages/messages.module'
import { NotificationsModule } from './notifications/notifications.module'
import { appConfig } from './config/app.config'

@Module({
  imports: [
    // Config — available everywhere
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10 },
      { name: 'medium', ttl: 10000, limit: 100 },
      { name: 'long',   ttl: 60000, limit: 1000 },
    ]),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    EngineersModule,
    ClientsModule,
    JobsModule,
    ProposalsModule,
    ContractsModule,
    PaymentsModule,
    MessagesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
