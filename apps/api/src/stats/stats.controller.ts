import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getOverview() {
    return this.statsService.getOverview();
  }
}
