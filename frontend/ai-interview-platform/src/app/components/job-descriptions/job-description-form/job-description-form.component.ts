import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobDescription, JobStatus, JobType } from '../../../models/job-description.model';
import { JobDescriptionService } from '../../../services/job-description.service';
import { MatOptionModule } from '@angular/material/core';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-job-description-form',
  templateUrl: './job-description-form.component.html',
  styleUrls: ['./job-description-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatOptionModule,
    MatRippleModule
  ]
})
export class JobDescriptionFormComponent implements OnInit, OnChanges {
  @Input() jobDescriptionId: string | null = null;
  @Output() formClose = new EventEmitter<void>();
  jobDescriptionForm: FormGroup;
  isEditMode: boolean = false;
  loading: boolean = false;
  error: string = '';
  jobTypes = Object.values(JobType);
  jobStatuses = Object.values(JobStatus);

  constructor(
    private fb: FormBuilder,
    private jobDescriptionService: JobDescriptionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.jobDescriptionForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      department: ['', Validators.required],
      location: ['', Validators.required],
      type: [JobType.FullTime, Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]],
      requirements: ['', [Validators.required, Validators.minLength(50)]],
      responsibilities: ['', [Validators.required, Validators.minLength(50)]],
      status: [JobStatus.Draft, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.jobDescriptionId) {
      this.isEditMode = true;
      this.loadJobDescription(this.jobDescriptionId);
    } else {
      this.isEditMode = false;
      this.jobDescriptionForm.reset();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['jobDescriptionId']) {
      if (this.jobDescriptionId) {
        this.isEditMode = true;
        this.loadJobDescription(this.jobDescriptionId);
      } else {
        this.isEditMode = false;
        this.jobDescriptionForm.reset();
      }
    }
  }

  loadJobDescription(id: string): void {
    this.loading = true;
    this.error = '';

    this.jobDescriptionService.getJobDescription(id).subscribe({
      next: (jobDescription) => {
        this.jobDescriptionForm.patchValue(jobDescription);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load job description';
        this.loading = false;
        console.error('Error loading job description:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.jobDescriptionForm.valid) {
      this.loading = true;
      this.error = '';

      const jobDescription: JobDescription = this.jobDescriptionForm.value;

      if (this.isEditMode) {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
          this.jobDescriptionService.updateJobDescription(id, jobDescription).subscribe({
            next: () => {
              this.loading = false;
              this.formClose.emit();
            },
            error: (error) => {
              this.error = 'Failed to update job description';
              this.loading = false;
              console.error('Error updating job description:', error);
            }
          });
        }
      } else {
        this.jobDescriptionService.createJobDescription(jobDescription).subscribe({
          next: () => {
            this.loading = false;
            this.formClose.emit();
          },
          error: (error) => {
            this.error = 'Failed to create job description';
            this.loading = false;
            console.error('Error creating job description:', error);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.formClose.emit();
  }

  getErrorMessage(controlName: string): string {
    const control = this.jobDescriptionForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength'].requiredLength;
      return `Minimum length is ${requiredLength} characters`;
    }
    return '';
  }
} 