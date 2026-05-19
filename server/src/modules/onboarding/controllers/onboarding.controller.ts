import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OnboardingService } from '../services/onboarding.service';
import { FirebaseAuthGuard } from '../../../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { BasicInfoDto } from '../dto/basic-info.dto';
import { ClassificationDto } from '../dto/classification.dto';
import { BodyMetricsDto } from '../dto/body-metrics.dto';
import { TrainingProfileDto } from '../dto/training-profile.dto';
import { GoalsDto } from '../dto/goals.dto';
import { InjuryHistoryDto } from '../dto/injury-history.dto';
import { ConsentDto } from '../dto/consent.dto';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(FirebaseAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  @ApiOperation({ summary: 'Retrieve active onboarding progress details and step metrics' })
  async getStatus(@CurrentUser() user: any) {
    const status = await this.onboardingService.getStatus(user.uid);
    return {
      success: true,
      message: 'Onboarding progress retrieved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('basic-info')
  @ApiOperation({ summary: 'Save Step 1: Basic Athlete Information' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Basic information saved' })
  async saveBasicInfo(@CurrentUser() user: any, @Body() dto: BasicInfoDto) {
    const status = await this.onboardingService.saveBasicInfo(user.uid, user.email, dto);
    return {
      success: true,
      message: 'Basic info saved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('classification')
  @ApiOperation({ summary: 'Save Step 2: Athlete Classification' })
  async saveClassification(@CurrentUser() user: any, @Body() dto: ClassificationDto) {
    const status = await this.onboardingService.saveClassification(user.uid, dto);
    return {
      success: true,
      message: 'Athlete classification saved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('body-metrics')
  @ApiOperation({ summary: 'Save Step 3: Body Metrics' })
  async saveBodyMetrics(@CurrentUser() user: any, @Body() dto: BodyMetricsDto) {
    const status = await this.onboardingService.saveBodyMetrics(user.uid, dto);
    return {
      success: true,
      message: 'Body metrics saved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('training-profile')
  @ApiOperation({ summary: 'Save Step 4: Training Profile' })
  async saveTrainingProfile(@CurrentUser() user: any, @Body() dto: TrainingProfileDto) {
    const status = await this.onboardingService.saveTrainingProfile(user.uid, dto);
    return {
      success: true,
      message: 'Training profile saved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('goals')
  @ApiOperation({ summary: 'Save Step 5: Athlete Goals' })
  async saveGoals(@CurrentUser() user: any, @Body() dto: GoalsDto) {
    const status = await this.onboardingService.saveGoals(user.uid, dto);
    return {
      success: true,
      message: 'Athlete goals saved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('injury-history')
  @ApiOperation({ summary: 'Save Step 6: Injury History' })
  async saveInjuryHistory(@CurrentUser() user: any, @Body() dto: InjuryHistoryDto) {
    const status = await this.onboardingService.saveInjuryHistory(user.uid, dto);
    return {
      success: true,
      message: 'Injury history saved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('consent')
  @ApiOperation({ summary: 'Save Step 7: Consent & Terms' })
  async saveConsent(@CurrentUser() user: any, @Body() dto: ConsentDto) {
    const status = await this.onboardingService.saveConsent(user.uid, dto);
    return {
      success: true,
      message: 'Consent preferences saved successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('complete')
  @ApiOperation({ summary: 'Lock in final onboarding completion and update access profiles' })
  async completeOnboarding(@CurrentUser() user: any) {
    const status = await this.onboardingService.completeOnboarding(user.uid);
    return {
      success: true,
      message: 'Athlete onboarding completed successfully',
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload profile image securely to cloud storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadPhoto(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file selected.');
    }
    const url = await this.onboardingService.uploadProfilePhoto(user.uid, file);
    return {
      success: true,
      message: 'Profile photo uploaded successfully',
      data: { url },
      timestamp: new Date().toISOString(),
    };
  }
}
