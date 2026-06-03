import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: any;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // First try to get token from cookie
    let token = request.cookies?.session;

    // Fallback to Bearer token for testing/swagger
    if (!token) {
      token = this.extractTokenFromHeader(request);
    }

    if (!token) {
      throw new UnauthorizedException('No session cookie or token provided');
    }

    try {
      // Verify session cookie or ID token
      // verifySessionCookie is for cookies, verifyIdToken is for bearer tokens
      // We check if it's a cookie (usually long) or a bearer token

      let decodedToken;
      if (request.cookies?.session) {
        decodedToken = await this.firebaseService.auth.verifySessionCookie(
          token,
          true,
        );
      } else {
        decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      }

      request.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
