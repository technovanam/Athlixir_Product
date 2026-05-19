import { IsBoolean, Equals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsentDto {
  @ApiProperty({ description: 'Agreement to terms of service', example: true })
  @IsBoolean()
  @Equals(true)
  termsAccepted: boolean;

  @ApiProperty({ description: 'Agreement to active AI analysis mechanics', example: true })
  @IsBoolean()
  @Equals(true)
  aiAnalysisConsent: boolean;

  @ApiProperty({ description: 'Agreement to active performance data storage', example: true })
  @IsBoolean()
  @Equals(true)
  dataStorageConsent: boolean;
}
