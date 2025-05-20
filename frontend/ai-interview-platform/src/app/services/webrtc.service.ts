import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class WebRTCService {
  private hubConnection: signalR.HubConnection;
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private connectionState = new BehaviorSubject<string>('disconnected');
  private errorState = new BehaviorSubject<string | null>(null);
  private isConnected = false;

  connectionState$ = this.connectionState.asObservable();
  errorState$ = this.errorState.asObservable();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/interviewHub`, {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    this.setupSignalR();
  }

  private setupSignalR() {
    this.hubConnection.start()
      .then(() => {
        console.log('SignalR Connected');
        this.isConnected = true;
        this.connectionState.next('connected');
      })
      .catch(err => {
        console.error('SignalR Connection Error:', err);
        this.errorState.next('Failed to connect to signaling server');
        this.connectionState.next('error');
      });

    this.hubConnection.on('ReceiveSignal', (userId: string, signal: any) => {
      this.handleSignal(signal);
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR Connection Closed');
      this.isConnected = false;
      this.connectionState.next('disconnected');
    });
  }

  private handleSignal(signal: any) {
    try {
      switch (signal.type) {
        case 'offer':
          this.handleOffer(signal);
          break;
        case 'answer':
          this.handleAnswer(signal);
          break;
        case 'candidate':
          this.handleCandidate(signal);
          break;
      }
    } catch (error) {
      console.error('Error handling signal:', error);
      this.errorState.next('Error processing signaling message');
    }
  }

  async startCall(isInitiator: boolean, roomId: string) {
    try {
      if (!this.isConnected) {
        throw new Error('SignalR connection not established');
      }

      this.connectionState.next('connecting');
      this.errorState.next(null);

      // Join the room
      await this.hubConnection.invoke('JoinRoom', roomId);

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      this.setupPeerConnection();

      if (isInitiator) {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        await this.hubConnection.invoke('SendSignal', roomId, {
          type: 'offer',
          sdp: offer
        });
      }

      this.connectionState.next('connected');
    } catch (error) {
      console.error('Error starting call:', error);
      this.errorState.next('Failed to start video call');
      this.connectionState.next('error');
    }
  }

  private setupPeerConnection() {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.isConnected) {
        this.hubConnection.invoke('SendSignal', 'current-room', {
          type: 'candidate',
          candidate: event.candidate
        }).catch(err => console.error('Error sending ICE candidate:', err));
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      this.connectionState.next(this.peerConnection?.iceConnectionState || 'disconnected');
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream!);
        }
      });
    }
  }

  private async handleOffer(signal: any) {
    if (!this.peerConnection || !this.isConnected) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      await this.hubConnection.invoke('SendSignal', 'current-room', {
        type: 'answer',
        sdp: answer
      });
    } catch (error) {
      console.error('Error handling offer:', error);
      this.errorState.next('Failed to establish connection');
    }
  }

  private async handleAnswer(signal: any) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } catch (error) {
      console.error('Error handling answer:', error);
      this.errorState.next('Failed to complete connection');
    }
  }

  private async handleCandidate(signal: any) {
    if (!this.peerConnection) return;

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  async endCall() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.connectionState.next('disconnected');
    this.errorState.next(null);
  }
} 