import { Module } from '@nestjs/common';
import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisService } from './services/analysis.service';
import { AnalysisGateway } from './gateways/analysis.gateway';
import { FirebaseModule } from '../../firebase/firebase.module';
import { AiInsightsModule } from '../ai-insights/ai-insights.module';
import { QueueService } from './services/queue.service';

@Module({
  imports: [FirebaseModule, AiInsightsModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisGateway, QueueService],
  exports: [AnalysisService, AnalysisGateway, QueueService],
})
export class AnalysisModule {}
