/* eslint-disable @typescript-eslint/dot-notation */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { CommonService } from '../utils/common.service';

@Injectable()
export class HttpRequestHeadersMiddleware implements NestMiddleware {
  constructor(private commonService: CommonService) {}

  use(request: Request, _response: Response, next: NextFunction) {
    // 1️⃣ JWT from cookie or Authorization header
    const token = request.cookies?.['jwt'] || (request.headers['authorization']?.split(' ')[1]);

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key-for-development');

        // Attach user info to headers
        request.headers['userId'] = decoded.sub; // user id from JWT
        (request.headers['user'] as any) = decoded;
      } catch (err) {
        console.warn('Invalid JWT token in request', err.message);
      }
    }

    // 2️⃣ Attach single DB connection
    (request.headers['dbConnection'] as any) = this.commonService.dbConnection;

    return next();
  }
}
