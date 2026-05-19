import { Controller, Post, Body, Req, Res, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import * as express from 'express';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { FirebaseAuthGuard } from '../guards/firebase-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new enterprise user and log them in' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User successfully created' })
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

    const sessionCookie = await this.authService.createSessionCookie(loginResult.idToken);

    // Set HttpOnly cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    response.cookie('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      message: 'Registration and login successful',
      user: loginResult.userProfile,
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user and set a secure HttpOnly session cookie' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Successfully authenticated' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const { idToken, userProfile } = await this.authService.login(loginDto);
    const sessionCookie = await this.authService.createSessionCookie(idToken);

    // Set HttpOnly cookie
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    response.cookie('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return {
      message: 'Login successful',
      user: userProfile,
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
    response.clearCookie('session');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Retrieve verified user profile session details' })
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.authService.getUserProfile(user.uid);
    return {
      user: profile || user,
    };
  }
}
