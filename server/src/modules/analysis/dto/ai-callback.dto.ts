import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiCallbackDto {
  @ApiProperty({ description: 'ID of the video analysis session' })
  @IsString()
  @IsNotEmpty()
  analysisId: string;

  @ApiProperty({ description: 'State of the video analysis pipeline' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional({ description: 'Current progress percentage or object' })
  @IsOptional()
  progress?: any;

  @ApiPropertyOptional({ description: 'Calculated running metrics' })
  @IsOptional()
  @IsObject()
  metrics?: Record<string, any>;

  @ApiPropertyOptional({
    description:
      'Benchmark results relative to standard performance categories',
  })
  @IsOptional()
  @IsObject()
  benchmarks?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Performance and efficiency scores' })
  @IsOptional()
  @IsObject()
  scores?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Athlete classification metrics' })
  @IsOptional()
  @IsObject()
  classification?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Overall injury risk level and primary area details',
  })
  @IsOptional()
  @IsObject()
  injuryRisk?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Detailed individual category injury risk items list',
  })
  @IsOptional()
  @IsArray()
  injuryRisks?: Record<string, any>[];

  @ApiPropertyOptional({
    description: 'AI generated observations and feedback',
  })
  @IsOptional()
  @IsObject()
  insights?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'AI generated coaching drill recommendations list',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendations?: string[];

  @ApiPropertyOptional({
    description: 'Indicates whether the PDF report is compiled',
  })
  @IsOptional()
  @IsBoolean()
  reportReady?: boolean;

  @ApiPropertyOptional({ description: 'Video frames per second metric' })
  @IsOptional()
  @IsNumber()
  fps?: number;

  @ApiPropertyOptional({ description: 'Video total length in seconds' })
  @IsOptional()
  @IsNumber()
  durationSec?: number;

  @ApiPropertyOptional({
    description: 'Total frames containing media landmarks',
  })
  @IsOptional()
  @IsNumber()
  landmarkFrameCount?: number;

  @ApiPropertyOptional({
    description:
      'Indicates whether the tracking skeleton overlay video is compiled',
  })
  @IsOptional()
  @IsBoolean()
  skeletonOverlayReady?: boolean;

  @ApiPropertyOptional({
    description: 'Public or internal storage path to overlay video file',
  })
  @IsOptional()
  @IsString()
  skeletonOverlayPath?: string;

  @ApiPropertyOptional({
    description: 'Biomechanical measurement warning flags list',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricFlags?: string[];

  @ApiPropertyOptional({ description: 'Diagnostic error message details' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Athlete progression comparison data' })
  @IsOptional()
  @IsObject()
  progressData?: Record<string, any>;
}
