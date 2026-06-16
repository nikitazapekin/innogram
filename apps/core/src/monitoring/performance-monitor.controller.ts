import { Controller, Get } from '@nestjs/common';
import { Public } from '@innogram/shared';

import { PerformanceMonitorService } from './performance-monitor.service';

@Public()
@Controller('monitoring')
export class PerformanceMonitorController {
  constructor(private readonly performanceMonitor: PerformanceMonitorService) {}

  @Get('metrics')
  getMetrics() {
    return this.performanceMonitor.getSnapshot();
  }
}
