import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, timer } from 'rxjs';
import { retryWhen, delayWhen, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface MarketPulse {
  sector: string;
  newPostings: number;
  avgSalaryK: number;
  competitionRatio: number;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private WS_URL = 'ws://localhost:3000';

  private socket$: WebSocketSubject<unknown> | null = null;
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private marketPulse$ = new Subject<MarketPulse>();

  readonly isConnected$ = this.connectionStatus$.asObservable();
  readonly marketData$  = this.marketPulse$.asObservable();

  connect(): void {
    if (this.socket$) return;

    this.socket$ = webSocket({
      url: this.WS_URL,
      openObserver: {
        next: () => {
          console.log('WebSocket connected');
          this.connectionStatus$.next(true);
        },
      },
      closeObserver: {
        next: () => {
          console.log('WebSocket disconnected');
          this.connectionStatus$.next(false);
          this.socket$ = null;
        },
      },
    });

    this.socket$.pipe(
      retryWhen(errors =>
        errors.pipe(
          tap(() => console.log('WebSocket dropped, reconnecting in 3s...')),
          delayWhen(() => timer(3000))
        )
      )
    ).subscribe({
      next: (msg: unknown) => this.handleMessage(msg),
      error: err => console.error('WebSocket fatal error:', err),
    });
  }

  private handleMessage(msg: unknown): void {
    const message = msg as { type: string; data?: MarketPulse };
    switch (message.type) {
      case 'market_pulse':
        if (message.data) {
          this.marketPulse$.next(message.data);
        }
        break;
      case 'connected':
        console.log('Server confirmed connection');
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  disconnect(): void {
    this.socket$?.complete();
    this.socket$ = null;
    this.connectionStatus$.next(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
