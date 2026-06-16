import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { FirebaseService } from '../../firebase/firebase.service';
import { AuthenticatedRequest } from './firebase-auth.guard';

@Injectable()
export class OptionalFirebaseAuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = null;

    let token = request.cookies?.session;
    if (!token) {
      token = this.extractTokenFromHeader(request);
    }

    if (!token) {
      return true;
    }

    try {
      if (request.cookies?.session) {
        request.user = await this.firebaseService.auth.verifySessionCookie(
          token,
          true,
        );
      } else {
        request.user = await this.firebaseService.auth.verifyIdToken(token);
      }
    } catch {
      request.user = null;
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
