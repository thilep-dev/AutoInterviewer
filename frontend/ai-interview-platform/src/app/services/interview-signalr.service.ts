import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InterviewSignalRService {
  private hubConnection: signalR.HubConnection;
  private aiQuestionSubject = new BehaviorSubject<string | null>(null);
  private aiFeedbackSubject = new BehaviorSubject<string | null>(null);

  aiQuestion$ = this.aiQuestionSubject.asObservable();
  aiFeedback$ = this.aiFeedbackSubject.asObservable();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/interviewHub`)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(err => console.error('Error starting SignalR connection:', err));

    this.hubConnection.on('ReceiveAIQuestion', (question: string) => {
      this.aiQuestionSubject.next(question);
    });

    this.hubConnection.on('ReceiveAIFeedback', (feedback: string) => {
      this.aiFeedbackSubject.next(feedback);
    });
  }

  joinInterviewRoom(interviewId: string) {
    this.hubConnection.invoke('JoinInterview', interviewId)
      .catch(err => console.error('Error joining interview room:', err));
  }

  leaveInterviewRoom(interviewId: string) {
    this.hubConnection.invoke('LeaveInterview', interviewId)
      .catch(err => console.error('Error leaving interview room:', err));
  }
} 