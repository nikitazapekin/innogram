import { Controller, Get, Header } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Public } from '@innogram/shared';

import { PerformanceMonitorService } from './performance-monitor.service';
import { PrometheusService } from './prometheus.service';

@Public()
@ApiTags('monitoring')
@Controller('monitoring')
export class PerformanceMonitorController {
  constructor(
    private readonly performanceMonitor: PerformanceMonitorService,
    private readonly prometheus: PrometheusService,
  ) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get application performance metrics snapshot' })
  @ApiOkResponse({ description: 'Performance metrics snapshot.' })
  getMetrics() {
    return this.performanceMonitor.getSnapshot();
  }

  @Get('prometheus')
  @ApiOperation({ summary: 'Get Prometheus-compatible metrics' })
  @ApiProduces('text/plain')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async getPrometheusMetrics(): Promise<string> {
    return this.prometheus.getMetrics();
  }
}
