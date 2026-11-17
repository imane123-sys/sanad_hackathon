import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Platform information and documentation link' })
  @ApiResponse({ status: 200, description: 'Information returned successfully' })
  getInfo() {
    return this.appService.getInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check probe' })
  @ApiResponse({ status: 200, description: 'Health check OK' })
  getHealth() {
    return this.appService.getHealth();
  }
}
