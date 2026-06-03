import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OnboardUserDto } from './dto/onboard.dto';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(FirebaseAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('profile')
  @ApiOperation({
    summary: 'Create or update user profile in Firestore',
    description: 'Requires a valid Firebase ID token in Authorization header',
  })
  async createProfile(
    @CurrentUser() user: any,
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createOrUpdateProfile(user.uid, createUserDto);
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get current user profile from Firestore',
  })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(user.uid);
  }

  @Post('onboard')
  @ApiOperation({
    summary: 'Complete onboarding wizard and initialize team workspace info',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Onboarding completed successfully',
  })
  async onboardUser(
    @CurrentUser() user: any,
    @Body() onboardUserDto: OnboardUserDto,
  ) {
    return this.usersService.onboardUser(user.uid, onboardUserDto);
  }
}
