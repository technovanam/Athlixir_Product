import { Module } from '@nestjs/common';
import { AnalysisController } from './controllers/analysis.controller';
import { AnalysisService } from './services/analysis.service';
import { AnalysisGateway } from './gateways/analysis.gateway';
import { FirebaseModule } from '../../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisGateway],
  exports: [AnalysisService, AnalysisGateway],
})
export class AnalysisModule {}
