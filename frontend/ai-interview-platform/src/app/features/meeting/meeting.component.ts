import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WebRTCService } from '@app/services/webrtc.service';
import { VideoComponent } from '@app/components/video/video.component';
import { UserService } from '@app/services/user.service';

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [VideoComponent],
  template: `
    <div class="meeting-header">
      <h2>Interview Meeting Room</h2>
      <p>Meeting ID: {{ roomId }}</p>
    </div>
    <app-video
      [localLabel]="localLabel"
      [remoteLabel]="remoteLabel"
      [localAvatar]="localAvatar"
      [remoteAvatar]="remoteAvatar">
    </app-video>
  `,
  styles: [`
    .meeting-header { text-align: center; margin-bottom: 1rem; }
  `]
})
export class MeetingComponent implements OnInit {
  roomId: string = '';
  localAvatar: string = '';
  remoteAvatar: string = '';
  localLabel: string = '';
  remoteLabel: string = '';

  constructor(
    private route: ActivatedRoute,
    private webRTCService: WebRTCService,
    public userService: UserService
  ) {}

  ngOnInit() {
    this.roomId = this.route.snapshot.paramMap.get('roomId') || '';
    this.webRTCService.startCall(true); // or false, depending on role

    // Set local avatar and label
    this.localAvatar = this.userService.currentUser.avatarUrl || this.userService.getInitials();
    this.localLabel = this.userService.currentUser.role === 'Candidate' ? 'You (Candidate)' : 'You (Interviewer)';

    // For demo, set remote avatar and label statically
    this.remoteAvatar = 'IN'; // Or a URL or fetch from API
    this.remoteLabel = this.userService.currentUser.role === 'Candidate' ? 'Interviewer' : 'Candidate';
  }
} 