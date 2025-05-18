import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatRippleModule } from '@angular/material/core';

import { Interview, InterviewStatus, InterviewMode, InterviewDifficulty, ScheduleType } from '@app/models/interview.model';
import { InterviewService } from '@app/services/interview.service';
import { CandidateService } from '@app/services/candidate.service';
import { JobDescriptionService } from '@app/services/job-description.service';

function getEnumNumericValues(enumObj: any): number[] {
  return Object.values(enumObj).filter(value => typeof value === 'number') as number[];
}

@Component({
  selector: 'app-interview-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
    MatOptionModule,
    MatRippleModule
  ],
  templateUrl: './interview-form.component.html',
  styleUrls: ['./interview-form.component.css']
})
export class InterviewFormComponent implements OnInit, OnChanges {
  @Input() interviewId: string | null = null;
  @Output() formClose = new EventEmitter<void>();
  interviewForm: FormGroup;
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string = '';
  candidates: any[] = [];
  jobs: any[] = [];
  interviewModes = getEnumNumericValues(InterviewMode);
  interviewStatuses = getEnumNumericValues(InterviewStatus);
  interviewDifficulties = getEnumNumericValues(InterviewDifficulty);
  scheduleTypes = getEnumNumericValues(ScheduleType);

  interviewStatusLabels = ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];
  interviewModeLabels = ['Oral', 'Coding', 'Both'];
  interviewDifficultyLabels = ['Basic', 'Intermediate', 'Advanced'];
  scheduleTypeLabels = ['Manual', 'Automatic'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private interviewService: InterviewService,
    private candidateService: CandidateService,
    private jobDescriptionService: JobDescriptionService
  ) {
    this.interviewForm = this.fb.group({
      candidateId: ['', Validators.required],
      jobId: ['', Validators.required],
      scheduledTime: ['', Validators.required],
      duration: [60, [Validators.required, Validators.min(1)]],
      status: [InterviewStatus.Scheduled, Validators.required],
      mode: [InterviewMode.Oral, Validators.required],
      difficulty: [InterviewDifficulty.Basic, Validators.required],
      scheduleType: [ScheduleType.Manual, Validators.required],
      meetingRoomId: ['default-room', Validators.required],
      notes: [''],
      feedback: [''],
      rating: [null]
    });
  }

  ngOnInit(): void {
    this.loadCandidates();
    this.loadJobs();

    if (this.interviewId) {
      this.isEditMode = true;
      this.loadInterview(this.interviewId);
    } else {
      this.isEditMode = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['interviewId']) {
      if (this.interviewId) {
        this.isEditMode = true;
        this.loadInterview(this.interviewId);
      } else {
        this.isEditMode = false;
      }
    }
  }

  loadCandidates(): void {
    this.candidateService.getCandidates().subscribe({
      next: (candidates) => {
        this.candidates = candidates;
      },
      error: (error) => {
        this.error = 'Failed to load candidates. Please try again.';
        console.error('Error loading candidates:', error);
      }
    });
  }

  loadJobs(): void {
    this.jobDescriptionService.getJobDescriptions().subscribe({
      next: (jobs) => {
        this.jobs = jobs;
      },
      error: (error) => {
        this.error = 'Failed to load jobs. Please try again.';
        console.error('Error loading jobs:', error);
      }
    });
  }

  loadInterview(id: string): void {
    this.loading = true;
    this.interviewService.getInterview(id).subscribe({
      next: (interview: Interview) => {
        this.interviewForm.patchValue({
          ...interview,
          scheduledTime: interview.scheduledTime ? new Date(interview.scheduledTime).toISOString().substring(0, 16) : ''
        });
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.error = 'Failed to load interview. Please try again.';
        console.error('Error loading interview:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.interviewForm.valid) {
      this.loading = true;
      const formData = this.interviewForm.value;

      const interviewData = {
        candidateId: formData.candidateId,
        jobDescriptionId: formData.jobId,
        mode: formData.mode,
        difficulty: formData.difficulty,
        scheduleType: formData.scheduleType,
        scheduledTime: formData.scheduledTime ? new Date(formData.scheduledTime).toISOString() : '',
        status: formData.status,
        meetingRoomId: formData.meetingRoomId,
        questions: [],
        participants: [],
        codeSubmissions: []
      };

      const request$ = this.isEditMode
        ? this.interviewService.updateInterview(this.interviewId!, interviewData)
        : this.interviewService.createInterview(interviewData);

      request$.subscribe({
        next: () => {
          this.loading = false;
          this.formClose.emit();
        },
        error: (error) => {
          this.loading = false;
          this.error = 'Failed to save interview. Please try again.';
          console.error('Error saving interview:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.formClose.emit();
  }

  getErrorMessage(controlName: string): string {
    const control = this.interviewForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('min')) {
      return 'Value must be greater than 0';
    }
    return '';
  }
} 