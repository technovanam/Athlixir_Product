import { Module } from '@nestjs/common';
import { FirebaseModule } from '../../firebase/firebase.module';
import { ClaudeService } from './claude.service';
import { GeminiService } from './gemini.service';
import { AiParserService } from './ai-parser.service';
import { AiInsightsService } from './ai-insights.service';
import { MetricValidatorService } from '../../ai/validators/metric-validator.service';
import { ConfidenceScoreService } from '../../ai/services/confidence-score.service';

@Module({
  imports: [FirebaseModule],
  providers: [
    ClaudeService,
    GeminiService,
    AiParserService,
    AiInsightsService,
    MetricValidatorService,
    ConfidenceScoreService,
  ],
  exports: [AiInsightsService],
})
export class AiInsightsModule {}
