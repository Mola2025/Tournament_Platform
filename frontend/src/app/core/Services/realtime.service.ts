import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../../environments/environment';

export interface RealtimeEvents {
  onMatchScoreUpdate?: () => void;
  onMatchStatusChange?: () => void;
  onPlayerJoined?: () => void;
  onGlobalAlert?: (message: string) => void;

}

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private socket: Socket | null = null;

  connect(events: RealtimeEvents): void {
    if (this.socket?.connected) return;

    if (this.socket) {
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(environment.apiUrl, {
      transports: ['websocket'],
    });

    if (events.onMatchScoreUpdate) {
      this.socket.on('match:score-update', events.onMatchScoreUpdate);
    }

    if (events.onMatchStatusChange) {
      this.socket.on('match:status-change', events.onMatchStatusChange);
    }

    if (events.onPlayerJoined) {
      this.socket.on('tournament:player-joined', events.onPlayerJoined);
    }

    if (events.onGlobalAlert) {
      this.socket.on('notification:global-alert', (payload: { message: string }) => {
        events.onGlobalAlert!(payload.message);
      });
    }
  }

  disconnect(): void {
    this.socket?.off();
    this.socket?.disconnect();
    this.socket = null;
  }
}