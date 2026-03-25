import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MedicalModule } from './modules/medical/medical.module';
import { TreatmentModule } from './modules/treatment/treatment.module';
import { EscortModule } from './modules/escort/escort.module';
import { TravelModule } from './modules/travel/travel.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { InstitutionModule } from './modules/institution/institution.module';
import { FileModule } from './modules/file/file.module';
import { AuditModule } from './modules/audit/audit.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ProductModule } from './modules/product/product.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { NotificationModule } from './modules/notification/notification.module';
import { GreenChannelModule } from './modules/green-channel/green-channel.module';

@Module({
  imports: [
    // 环境变量
    ConfigModule.forRoot({ isGlobal: true }),

    // 数据库
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', '127.0.0.1'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'qihuang_health'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // 生产环境绝对不能开
        logging: config.get('NODE_ENV') === 'development',
        timezone: '+08:00',
        // 连接池配置（多实例部署必须）
        extra: {
          connectionLimit: 30,
        },
      }),
    }),

    // 业务模块
    AuthModule,
    UserModule,
    ProfileModule,
    MedicalModule,
    TreatmentModule,
    EscortModule,
    TravelModule,
    OrderModule,
    PaymentModule,
    InstitutionModule,
    FileModule,
    AuditModule,
    TenantModule,
    ProductModule,
    DashboardModule,
    SettlementModule,
    NotificationModule,
    GreenChannelModule,
  ],
})
export class AppModule {}
