import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { OptionalFirebaseAuthGuard } from './guards/optional-firebase-auth.guard';

@Module({
  imports: [FirebaseModule],
  providers: [AuthService, OptionalFirebaseAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
