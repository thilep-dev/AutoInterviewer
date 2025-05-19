import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CodeEditorComponent } from '../../components/code-editor/code-editor.component';
import { VideoComponent } from '../../components/video/video.component';
import { WebRTCService } from '../../services/webrtc.service';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule, CodeEditorComponent, VideoComponent],
  template: `
    <div class="interview-container">
      <div class="interview-header">
        <h1>Technical Interview</h1>
        <div class="interview-info">
          <p>Interview ID: {{interviewId}}</p>
          <p>Status: {{status}}</p>
        </div>
      </div>

      <div class="interview-content">
        <div class="main-content">
          <div class="question-section">
            <h2>Question</h2>
            <div class="question-content">
              {{currentQuestion}}
            </div>
          </div>

          <div class="code-section">
            <h2>Your Solution</h2>
            <app-code-editor></app-code-editor>
          </div>
        </div>

        <div class="video-section">
          <app-video></app-video>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .interview-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .interview-header {
      margin-bottom: 2rem;
    }

    .interview-info {
      display: flex;
      gap: 2rem;
      color: #666;
    }

    .interview-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .question-section, .code-section {
      background: #fff;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .video-section {
      position: sticky;
      top: 2rem;
      height: fit-content;
    }

    h1 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    h2 {
      margin: 0 0 1rem 0;
      color: #444;
    }

    .question-content {
      white-space: pre-wrap;
      line-height: 1.6;
    }
  `]
})
export class InterviewComponent implements OnInit {
  interviewId: string = '';
  status: string = 'In Progress';
  currentQuestion: string = '';

  constructor(
    private route: ActivatedRoute,
    private webRTCService: WebRTCService
  ) {}

  ngOnInit() {
    this.interviewId = this.route.snapshot.paramMap.get('id') || 'new';
    // TODO: Load interview data and questions
    this.currentQuestion = `Write a function that takes a string as input and returns the number of vowels in the string.
For example:
Input: "hello"
Output: 2

Input: "aeiou"
Output: 5

Input: "xyz"
Output: 0`;

    // Start WebRTC call with the interview ID as the room ID
    this.webRTCService.startCall(true, this.interviewId);
  }
} 