import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
    let controller: AppController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
        }).compile();

        controller = module.get<AppController>(AppController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getHealth', () => {
        it('should return status ok', () => {
            const result = controller.getHealth();
            expect(result).toEqual({ status: 'ok' });
        });
    });
});

