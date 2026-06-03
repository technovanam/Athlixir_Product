import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const RUNNING_TYPES = ['Sprint', 'Middle Distance', 'Long Distance'];
const COMPETITION_LEVELS = [
  'Beginner',
  'School',
  'District',
  'State',
  'National',
];

export class ClassificationDto {
  @ApiProperty({ description: 'Category type of running', enum: RUNNING_TYPES })
  @IsString()
  @IsNotEmpty()
  @IsIn(RUNNING_TYPES)
  runningType: string;

  @ApiProperty({
    description: 'Primary track event selection',
    example: '100m',
  })
  @IsString()
  @IsNotEmpty()
  primaryEvent: string;

  @ApiProperty({
    description: 'Secondary track event selection',
    example: '200m',
  })
  @IsString()
  @IsNotEmpty()
  secondaryEvent: string;

  @ApiProperty({
    description: 'Athletic competition class level',
    enum: COMPETITION_LEVELS,
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(COMPETITION_LEVELS)
  competitionLevel: string;
}
