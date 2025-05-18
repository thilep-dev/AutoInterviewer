import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { JobDescription, JobStatus, JobType } from '../../../models/job-description.model';
import { JobDescriptionService } from '../../../services/job-description.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { JobDescriptionFormComponent } from '../job-description-form/job-description-form.component';

@Component({
  selector: 'app-job-description-list',
  templateUrl: './job-description-list.component.html',
  styleUrls: ['./job-description-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatFormFieldModule,
    MatSidenavModule,
    JobDescriptionFormComponent
  ]
})
export class JobDescriptionListComponent implements OnInit {
  displayedColumns: string[] = ['title', 'department', 'location', 'type', 'status', 'actions'];
  dataSource: MatTableDataSource<JobDescription>;
  loading: boolean = false;
  error: string = '';
  isDrawerOpen: boolean = false;
  selectedJobDescriptionId: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  typeMap: { [key: string]: string } = JobType;
  statusMap: { [key: string]: string } = JobStatus;

  constructor(
    private jobDescriptionService: JobDescriptionService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<JobDescription>();
  }

  ngOnInit(): void {
    this.loadJobDescriptions();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadJobDescriptions(): void {
    this.loading = true;
    this.error = '';

    this.jobDescriptionService.getJobDescriptions().subscribe({
      next: (jobDescriptions) => {
        this.dataSource.data = jobDescriptions;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load job descriptions';
        this.loading = false;
        console.error('Error loading job descriptions:', error);
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDrawer(jobDescriptionId?: string): void {
    this.selectedJobDescriptionId = jobDescriptionId || null;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedJobDescriptionId = null;
    this.loadJobDescriptions();
  }

  addJobDescription(): void {
    this.openDrawer();
  }

  editJobDescription(id: string): void {
    this.openDrawer(id);
  }

  deleteJobDescription(id: string): void {
    if (confirm('Are you sure you want to delete this job description?')) {
      this.jobDescriptionService.deleteJobDescription(id).subscribe({
        next: () => {
          this.loadJobDescriptions();
        },
        error: (error) => {
          this.error = 'Failed to delete job description';
          console.error('Error deleting job description:', error);
        }
      });
    }
  }

  publishJobDescription(id: string): void {
    this.jobDescriptionService.publishJobDescription(id).subscribe({
      next: () => {
        this.loadJobDescriptions();
      },
      error: (error) => {
        this.error = 'Failed to publish job description';
        console.error('Error publishing job description:', error);
      }
    });
  }

  closeJobDescription(id: string): void {
    this.jobDescriptionService.closeJobDescription(id).subscribe({
      next: () => {
        this.loadJobDescriptions();
      },
      error: (error) => {
        this.error = 'Failed to close job description';
        console.error('Error closing job description:', error);
      }
    });
  }

  isPublished(status: JobStatus): boolean {
    return status === JobStatus.Published;
  }

  isClosed(status: JobStatus): boolean {
    return status === JobStatus.Closed;
  }
} 