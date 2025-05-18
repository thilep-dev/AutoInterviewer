import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Candidate } from '../../../models/candidate.model';
import { CandidateService } from '../../../services/candidate.service';
import { JobDescriptionService } from '../../../services/job-description.service';
import { JobDescription } from '../../../models/job-description.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatRippleModule } from '@angular/material/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

// Update the enum to match backend values
export enum CandidateStatus {
  Scheduled = 'Scheduled',
  Ongoing = 'Ongoing',
  Selected = 'Selected',
  Rejected = 'Rejected',
  Pending = 'Pending'
}

export enum DifficultyLevel {
  Basic = 'Basic',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced'
}

export enum InterviewMode {
  Oral = 'Oral',
  Coding = 'Coding',
  Both = 'Both'
}

export enum ScheduleType {
  Manual = 'Manual',
  Automatic = 'Automatic'
}

@Component({
  selector: 'app-candidate-form',
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.css'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
    MatOptionModule,
    MatRippleModule
  ]
})
export class CandidateFormComponent implements OnInit, OnChanges {
  @Input() candidateId: string | null = null;
  candidateForm: FormGroup;
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string = '';
  candidateStatuses = Object.values(CandidateStatus);
  difficultyLevels = Object.values(DifficultyLevel);
  interviewModes = Object.values(InterviewMode);
  scheduleTypes = Object.values(ScheduleType);
  jobDescriptions: JobDescription[] = [];
  @Output() formClose = new EventEmitter<void>();
  selectedFileName = '';

  constructor(
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private jobDescriptionService: JobDescriptionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.candidateForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      status: [CandidateStatus.Pending, Validators.required],
      resumeContent: ['', Validators.required],
      notes: [''],
      assignedJobDescription: [null, Validators.required],
      difficultyLevel: [DifficultyLevel.Basic, Validators.required],
      mode: [InterviewMode.Oral, Validators.required],
      scheduleType: [ScheduleType.Manual, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadJobDescriptions();
    if (this.candidateId) {
      this.isEditMode = true;
      this.loadCandidate(this.candidateId);
    } else {
      this.isEditMode = false;
      this.candidateForm.reset();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidateId']) {
      if (this.candidateId) {
        this.isEditMode = true;
        this.loadCandidate(this.candidateId);
      } else {
        this.isEditMode = false;
        this.candidateForm.reset();
      }
    }
  }

  loadJobDescriptions(): void {
    this.jobDescriptionService.getJobDescriptions().subscribe({
      next: (jobDescriptions) => {
        this.jobDescriptions = jobDescriptions;
      },
      error: (error) => {
        console.error('Error loading job descriptions:', error);
        this.error = 'Failed to load job descriptions';
      }
    });
  }

  loadCandidate(id: string): void {
    this.loading = true;
    this.error = '';

    this.candidateService.getCandidate(id).subscribe({
      next: (candidate) => {
        this.candidateForm.patchValue({
          ...candidate,
          status: this.candidateStatuses[Number(candidate.status)],
          difficultyLevel: this.difficultyLevels[Number(candidate.difficultyLevel)],
          mode: this.interviewModes[Number(candidate.mode)],
          scheduleType: this.scheduleTypes[Number(candidate.scheduleType)],
          assignedJobDescription: this.jobDescriptions.find(j => j.id === candidate.assignedJobDescriptionId)
        });
        // Show resume file name if resumeContent exists
        if (candidate.resumeContent) {
          this.selectedFileName = 'Resume Uploaded';
        } else {
          this.selectedFileName = '';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load candidate';
        this.loading = false;
        console.error('Error loading candidate:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.candidateForm.valid) {
      this.loading = true;
      this.error = '';

      const formValue = this.candidateForm.value;
      const payload = {
        name: `${formValue.firstName} ${formValue.lastName}`,
        email: formValue.email,
        phoneNumber: formValue.phone,
        resumeContent: formValue.resumeContent,
        status: formValue.status,
        assignedJobDescriptionId: formValue.assignedJobDescription?.id,
        difficultyLevel: formValue.difficultyLevel,
        mode: formValue.mode,
        scheduleType: formValue.scheduleType,
        notes: formValue.notes
      };

      if (this.isEditMode) {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.candidateService.updateCandidate(id, payload).subscribe({
            next: () => {
              this.loading = false;
              this.formClose.emit();
            },
            error: (error) => {
              this.error = 'Failed to update candidate';
              this.loading = false;
              console.error('Error updating candidate:', error);
            }
          });
        }
      } else {
        this.candidateService.createCandidate(payload).subscribe({
          next: () => {
            this.loading = false;
            this.formClose.emit();
          },
          error: (error) => {
            this.error = 'Failed to create candidate';
            this.loading = false;
            console.error('Error creating candidate:', error);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.formClose.emit();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1] || '';
        this.candidateForm.patchValue({ resumeContent: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.candidateForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${requiredLength} characters`;
    }
    if (control?.hasError('pattern')) {
      return 'Please enter a valid 10-digit phone number';
    }
    return '';
  }
} 