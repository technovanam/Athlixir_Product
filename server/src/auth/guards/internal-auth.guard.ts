import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

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

    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) {
      throw new UnauthorizedException('Internal API secret is not configured');
    }

    if (token !== secret) {
      throw new UnauthorizedException('Invalid internal API secret');
    }

    return true;
  }
}
