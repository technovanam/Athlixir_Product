import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AnalysisService } from '../services/analysis.service';
import { FirebaseAuthGuard } from '../../../auth/guards/firebase-auth.guard';
import { InternalAuthGuard } from '../../../auth/guards/internal-auth.guard';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';
import { AiCallbackDto } from '../dto/ai-callback.dto';

@ApiTags('Analysis')
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('upload')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload athlete running video and trigger biomechanics processing',
  })
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
  async uploadVideo(@CurrentUser() user: any, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No video file selected for analysis.');
    }
    return this.analysisService.uploadAndAnalyze(user.uid, file);
  }

  @Get('list')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Retrieve historical running analysis records' })
  async listAnalyses(@CurrentUser() user: any) {
    return this.analysisService.listAnalyses(user.uid);
  }

  @Get('evolution')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Retrieve athlete multi-session evolution and progression trends',
  })
  async getEvolution(@CurrentUser() user: any) {
    return this.analysisService.getAthleteEvolution(user.uid);
  }

  /** Must be registered before @Get(':id') so "overlay" is not treated as an id. */
  @Post('overlay')
  @UseGuards(InternalAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary:
      'Internal AI endpoint to upload skeleton overlay video to Firebase Storage',
  })
  @ApiConsumes('multipart/form-data')
  async uploadOverlay(
    @UploadedFile() file: any,
    @Body('analysisId') analysisId: string,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No overlay video file provided.');
    }
    if (!analysisId || !userId) {
      throw new BadRequestException('Missing analysisId or userId.');
    }
    return this.analysisService.uploadSkeletonOverlay(analysisId, userId, file);
  }

  @Post('report')
  @UseGuards(InternalAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Internal AI endpoint to upload HTML biomechanics report',
  })
  @ApiConsumes('multipart/form-data')
  async uploadReport(
    @UploadedFile() file: any,
    @Body('analysisId') analysisId: string,
    @Body('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No report file provided.');
    }
    if (!analysisId || !userId) {
      throw new BadRequestException('Missing analysisId or userId.');
    }
    return this.analysisService.uploadReport(analysisId, userId, file);
  }

  @Get(':id/report')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Stream HTML biomechanics report' })
  async streamReport(
    @Param('id') analysisId: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const { stream, contentType } = await this.analysisService.streamReport(
      analysisId,
      user,
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    stream.pipe(res);
  }

  @Get(':id/video/:type')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Stream analysis video through API (avoids Firebase CORS)',
  })
  async streamVideo(
    @Param('id') analysisId: string,
    @Param('type') type: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    if (type !== 'original' && type !== 'overlay') {
      throw new BadRequestException('Video type must be original or overlay.');
    }
    const { stream, contentType } = await this.analysisService.streamVideo(
      analysisId,
      user,
      type,
    );
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    stream.pipe(res);
  }

  @Post(':id/chat')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary:
      'Interact with AI Athlete Assistant copilot dynamically based on telemetry context',
  })
  async chatWithCopilot(
    @Param('id') analysisId: string,
    @Body('message') message: string,
    @CurrentUser() user: any,
  ) {
    if (!message) {
      throw new BadRequestException('Message cannot be empty.');
    }
    return this.analysisService.chatWithAthleteAssistant(
      analysisId,
      user.uid,
      message,
    );
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({
    summary: 'Retrieve detailed running biomechanics profile by ID',
  })
  async getAnalysis(@Param('id') analysisId: string) {
    return this.analysisService.getAnalysis(analysisId);
  }

  @Post('callback')
  @UseGuards(InternalAuthGuard)
  @ApiOperation({
    summary:
      'Internal AI callback endpoint to synchronize biomechanics results',
  })
  async aiCallback(@Body() body: AiCallbackDto) {
    const { analysisId, status, progress, ...payload } = body;
    if (!analysisId || !status) {
      throw new BadRequestException('Missing analysisId or status in payload.');
    }

    // Resolve naming collision: 'progress' object from Python is actually athlete progression comparison data
    let progressNum = 100;
    if (typeof progress === 'number') {
      progressNum = progress;
    }

    if (progress && typeof progress === 'object') {
      payload.progressData = progress;
    }

    // Save to Firestore and emit real-time WebSocket event
    await this.analysisService.updateStatus(
      analysisId,
      status,
      progressNum,
      payload,
    );

    return {
      success: true,
      message: 'State synced successfully',
    };
  }
}
