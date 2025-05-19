import { Component, ElementRef, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRTCService } from '../../services/webrtc.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-container">
      <div class="status-indicator" [class]="connectionState">
        {{ getStatusText() }}
      </div>
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
      <div class="video-grid">
        <div class="video-wrapper">
          <video #localVideo autoplay muted playsinline *ngIf="isVideoEnabled && hasLocalStream"></video>
          <div class="avatar" *ngIf="!isVideoEnabled || !hasLocalStream">
            <img *ngIf="localAvatar && isImage(localAvatar)" [src]="localAvatar" alt="Avatar" />
            <span *ngIf="localAvatar && !isImage(localAvatar)">{{ localAvatar }}</span>
            <span *ngIf="!localAvatar">?</span>
          </div>
          <div class="video-label">{{ localLabel }}</div>
        </div>
        <div class="video-wrapper">
          <video #remoteVideo autoplay playsinline *ngIf="hasRemoteStream"></video>
          <div class="avatar" *ngIf="!hasRemoteStream">
            <img *ngIf="remoteAvatar && isImage(remoteAvatar)" [src]="remoteAvatar" alt="Avatar" />
            <span *ngIf="remoteAvatar && !isImage(remoteAvatar)">{{ remoteAvatar }}</span>
            <span *ngIf="!remoteAvatar">?</span>
          </div>
          <div class="video-label">{{ remoteLabel }}</div>
        </div>
      </div>
      <div class="controls">
        <button (click)="toggleMute()" [class.active]="isMuted">
          <i class="fas" [class.fa-microphone]="!isMuted" [class.fa-microphone-slash]="isMuted"></i>
        </button>
        <button (click)="toggleVideo()" [class.active]="!isVideoEnabled">
          <i class="fas" [class.fa-video]="isVideoEnabled" [class.fa-video-slash]="!isVideoEnabled"></i>
        </button>
        <button (click)="endCall()" class="end-call">
          <i class="fas fa-phone-slash"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .video-container {
      background: #1a1a1a;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .status-indicator {
      text-align: center;
      color: #fff;
      background: #444;
      padding: 0.5rem;
    }
    .status-indicator.connected {
      background: #28a745;
    }
    .status-indicator.connecting {
      background: #ffc107;
    }
    .status-indicator.error {
      background: #dc3545;
    }
    .error {
      color: #fff;
      background: #dc3545;
      text-align: center;
      padding: 0.5rem;
    }
    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }
    .video-wrapper {
      position: relative;
      aspect-ratio: 16/9;
      background: #000;
      border-radius: 4px;
      overflow: hidden;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar {
      width: 100%;
      height: 100%;
      background: #444;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: bold;
      border-radius: 4px;
    }
    .avatar img {
      width: 60%;
      height: 60%;
      border-radius: 50%;
      object-fit: cover;
    }
    .video-label {
      position: absolute;
      bottom: 0.5rem;
      left: 0.5rem;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 1rem;
      background: #2a2a2a;
    }
    button {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: none;
      background: #3a3a3a;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    button:hover {
      background: #4a4a4a;
    }
    button.active {
      background: #dc3545;
    }
    button.end-call {
      background: #dc3545;
    }
    button.end-call:hover {
      background: #c82333;
    }
    i {
      font-size: 1.25rem;
    }
  `]
})
export class VideoComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  @Input() localLabel: string = 'You';
  @Input() remoteLabel: string = 'Other Participant';
  @Input() localAvatar: string | null = null;
  @Input() remoteAvatar: string | null = null;

  isMuted = false;
  isVideoEnabled = true;
  connectionState = 'disconnected';
  errorMessage = '';
  hasLocalStream = false;
  hasRemoteStream = false;
  private roomId: string = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private webRTCService: WebRTCService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.subscriptions.push(
      this.webRTCService.connectionState$.subscribe(state => {
        this.connectionState = state;
      }),
      this.webRTCService.errorState$.subscribe(error => {
        this.errorMessage = error || '';
      }),
      this.route.params.subscribe(params => {
        this.roomId = params['roomId'];
        if (this.roomId) {
          // Start the call when we have the room ID
          this.startCall();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.endCall();
  }

  private async startCall() {
    try {
      // Determine if this is the initiator (you can use any logic here)
      const isInitiator = true; // For testing, you can make this dynamic
      await this.webRTCService.startCall(isInitiator, this.roomId);
      this.setupVideoStreams();
    } catch (error) {
      console.error('Error starting call:', error);
      this.errorMessage = 'Failed to start video call';
    }
  }

  private setupVideoStreams() {
    const localStream = this.webRTCService.getLocalStream();
    const remoteStream = this.webRTCService.getRemoteStream();

    this.hasLocalStream = !!localStream;
    this.hasRemoteStream = !!remoteStream;

    if (localStream && this.localVideo) {
      this.localVideo.nativeElement.srcObject = localStream;
    }
    if (remoteStream && this.remoteVideo) {
      this.remoteVideo.nativeElement.srcObject = remoteStream;
    }
  }

  getStatusText(): string {
    switch (this.connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      default:
        return 'Disconnected';
    }
  }

  isImage(value: string): boolean {
    return value.startsWith('http://') || value.startsWith('https://') || 
           value.endsWith('.png') || value.endsWith('.jpg') || value.endsWith('.jpeg');
  }

  toggleMute() {
    const localStream = this.webRTCService.getLocalStream();
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      this.isMuted = !this.isMuted;
    }
  }

  toggleVideo() {
    const localStream = this.webRTCService.getLocalStream();
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      this.isVideoEnabled = !this.isVideoEnabled;
    }
  }

  async endCall() {
    await this.webRTCService.endCall();
  }
} 