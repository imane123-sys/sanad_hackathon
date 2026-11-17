import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return platform info', () => {
      const info = appController.getInfo();
      expect(info).toHaveProperty('name', 'SANAD API');
      expect(info).toHaveProperty('version', '1.0.0');
    });

    it('should return health status ok', () => {
      const health = appController.getHealth();
      expect(health).toHaveProperty('status', 'ok');
      expect(health).toHaveProperty('service', 'sanad-backend');
    });
  });
});
