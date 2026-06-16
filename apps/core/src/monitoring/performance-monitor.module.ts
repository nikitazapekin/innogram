import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { PerformanceMonitorController } from './performance-monitor.controller';
import { PerformanceMonitorInterceptor } from './performance-monitor.interceptor';
import { PerformanceMonitorService } from './performance-monitor.service';

@Global()
@Module({
  controllers: [PerformanceMonitorController],
  providers: [
    PerformanceMonitorService,
    PerformanceMonitorInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceMonitorInterceptor,
    },
  ],
  exports: [PerformanceMonitorService],
})
export class PerformanceMonitorModule {}
