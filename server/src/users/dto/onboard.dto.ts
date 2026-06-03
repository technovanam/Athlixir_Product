import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OnboardUserDto {
  @ApiProperty({ description: "The name of the user's team/organization" })
  @IsString()
  @IsNotEmpty()
  workspaceName: string;

  @ApiProperty({ description: 'The role or function of the user in the team' })
  @IsString()
  @IsNotEmpty()
  roleInWorkspace: string;

  @ApiProperty({ description: 'The size of the team' })
  @IsNumber()
  @IsOptional()
  workspaceSize?: number;

  @ApiProperty({
    description: 'Workspace industries or focus areas',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  industries?: string[];
}
