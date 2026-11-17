import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'sanad-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getInfo() {
    return {
      name: 'SANAD API',
      version: '1.0.0',
      description: 'Plateforme SANAD - Ensemble pour votre sécurité et solidarité',
      documentation: '/api/docs',
    };
  }
}
