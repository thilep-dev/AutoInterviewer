import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface WebSocketMessage {
  type: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket$: WebSocketSubject<any>;
  private messagesSubject = new Subject<WebSocketMessage>();
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.socket$ = webSocket(environment.wsUrl);
    this.setupWebSocket();
  }

  private setupWebSocket() {
    this.socket$.subscribe({
      next: (message) => this.messagesSubject.next(message),
      error: (err) => console.error('WebSocket error:', err),
      complete: () => console.log('WebSocket connection closed')
    });
  }

  sendCodeExecution(code: string, language: string) {
    this.socket$.next({
      type: 'code_execution',
      data: {
        code,
        language
      }
    });
  }

  sendTestResult(testCaseId: string, result: any) {
    this.socket$.next({
      type: 'test_result',
      data: {
        testCaseId,
        result
      }
    });
  }

  close() {
    this.socket$.complete();
  }
} 