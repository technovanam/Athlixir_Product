import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import * as express from 'express';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { OptionalFirebaseAuthGuard } from '../guards/optional-firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { setAuthCookies, clearAuthCookies } from '../utils/auth-cookies';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new enterprise user and log them in' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created',
  })
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    // 1. Sign up the user
    const profile = await this.authService.signup(signupDto);

    // 2. Automatically log them in to generate session cookie
    const loginResult = await this.authService.login({
      email: signupDto.email,
      password: signupDto.password,
    });

    const sessionCookie = await this.authService.createSessionCookie(
      loginResult.idToken,
    );

    setAuthCookies(response, sessionCookie);

    return {
      message: 'Registration and login successful',
      user: loginResult.userProfile,
      idToken: loginResult.idToken,
      refreshToken: loginResult.refreshToken,
    };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Authenticate user and set a secure HttpOnly session cookie',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully authenticated',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const { idToken, refreshToken, userProfile } =
      await this.authService.login(loginDto);
    const sessionCookie = await this.authService.createSessionCookie(idToken);

    setAuthCookies(response, sessionCookie);

    return {
      message: 'Login successful',
      user: userProfile,
      idToken,
      refreshToken,
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Clear session cookies and revoke refresh tokens' })
  async logout(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const sessionCookie = request.cookies?.session || '';
    if (sessionCookie) {
      await this.authService.revokeSession(sessionCookie);
    }
    clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh Firebase ID token for cross-origin clients' })
  async refresh(
    @Body() body: { refreshToken: string },
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const { idToken, refreshToken } = await this.authService.refreshIdToken(
      body.refreshToken,
    );
    const sessionCookie = await this.authService.createSessionCookie(idToken);
    setAuthCookies(response, sessionCookie);

    return {
      message: 'Token refreshed',
      idToken,
      refreshToken,
    };
  }

  @Get('me')
  @UseGuards(OptionalFirebaseAuthGuard)
  @ApiOperation({ summary: 'Retrieve verified user profile session details' })
  async getProfile(@CurrentUser() user: any) {
    if (!user?.uid) {
      return { user: null };
    }

    const profile = await this.authService.getUserProfile(user.uid);
    return {
      user: profile || user,
    };
  }
}
