import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { corsOptions } from '../../../core/config/cors.config';

@WebSocketGateway({
  cors: corsOptions,
})
export class AnalysisGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AnalysisGateway.name);

  @SubscribeMessage('subscribeToAnalysis')
  handleSubscribe(
    @MessageBody() data: { analysisId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data?.analysisId) {
      return { status: 'error', message: 'Missing analysisId' };
    }
    const room = `analysis:${data.analysisId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { status: 'subscribed', room };
  }

  broadcastStatus(
    analysisId: string,
    status: string,
    progress: number,
    data?: any,
  ) {
    const room = `analysis:${analysisId}`;
    if (this.server) {
      this.server.to(room).emit('analysisStatus', {
        analysisId,
        status,
        progress,
        timestamp: new Date().toISOString(),
        data,
      });
      this.logger.log(
        `Broadcasted analysis ${analysisId} status: ${status} (${progress}%)`,
      );
    } else {
      this.logger.warn(
        `WebSocketServer is not initialized. Cannot broadcast status: ${status}`,
      );
    }
  }
}
