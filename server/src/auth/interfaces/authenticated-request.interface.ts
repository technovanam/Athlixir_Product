import * as express from 'express';

export interface AuthenticatedRequest extends express.Request {
  user: {
    uid: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
}
