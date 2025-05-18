import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Interview, InterviewStatus, InterviewMode } from '../../../models/interview.model';
import { InterviewService } from '../../../services/interview.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { InterviewFormComponent } from '../interview-form/interview-form.component';

@Component({
  selector: 'app-interview-list',
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    InterviewFormComponent
  ]
})
export class InterviewListComponent implements OnInit {
  displayedColumns: string[] = ['candidateName', 'jobTitle', 'scheduledDate', 'duration', 'status', 'mode', 'actions'];
  dataSource: MatTableDataSource<Interview>;
  loading: boolean = false;
  error: string = '';
  isDrawerOpen: boolean = false;
  selectedInterviewId: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  statusLabels = ['Scheduled', 'InProgress', 'Completed', 'Cancelled'];
  modeLabels = ['Oral', 'Coding', 'Both'];

  constructor(private interviewService: InterviewService) {
    this.dataSource = new MatTableDataSource<Interview>();
  }

  ngOnInit(): void {
    this.loadInterviews();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadInterviews(): void {
    this.loading = true;
    this.error = '';
    this.interviewService.getInterviews().subscribe({
      next: (interviews) => {
        this.dataSource.data = interviews;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load interviews';
        this.loading = false;
        console.error('Error loading interviews:', error);
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

  openDrawer(interviewId?: string): void {
    this.selectedInterviewId = interviewId || null;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedInterviewId = null;
    this.loadInterviews();
  }

  addInterview(): void {
    this.openDrawer();
  }

  editInterview(id: string): void {
    this.openDrawer(id);
  }

  deleteInterview(id: string): void {
    if (confirm('Are you sure you want to delete this interview?')) {
      this.interviewService.deleteInterview(id).subscribe({
        next: () => {
          this.loadInterviews();
        },
        error: (error) => {
          this.error = 'Failed to delete interview';
          console.error('Error deleting interview:', error);
        }
      });
    }
  }
} 