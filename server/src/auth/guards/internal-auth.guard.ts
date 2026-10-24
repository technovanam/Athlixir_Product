import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

/** Shared server<->AI-engine secret. Empty string means not configured. */
export function getInternalApiSecret(): string {
  return (process.env.INTERNAL_API_SECRET || '').trim();
}

@Injectable()
export class InternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization format');
    }

    // Fail closed: never fall back to a default secret, which would be public
    // in source control.
    const secret = getInternalApiSecret();
    if (!secret) {
      throw new InternalServerErrorException(
        'Internal API secret is not configured',
      );
    }

    const given = Buffer.from(token);
    const expected = Buffer.from(secret);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      throw new UnauthorizedException('Invalid internal API secret');
    }

    return true;
  }
}
