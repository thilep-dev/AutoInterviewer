import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { Candidate, CandidateStatus } from '../../../models/candidate.model';
import { CandidateService } from '../../../services/candidate.service';
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
import { CandidateFormComponent } from '../candidate-form/candidate-form.component';

@Component({
  selector: 'app-candidate-list',
  templateUrl: './candidate-list.component.html',
  styleUrls: ['./candidate-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
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
    CandidateFormComponent
  ]
})
export class CandidateListComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'phoneNumber', 'status', 'actions'];
  dataSource: MatTableDataSource<Candidate>;
  loading: boolean = false;
  error: string = '';
  isDrawerOpen: boolean = false;
  selectedCandidateId: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  statusMap: { [key: number]: string } = {
    0: 'Scheduled',
    1: 'Ongoing',
    2: 'Selected',
    3: 'Rejected',
    4: 'Pending'
  };

  constructor(
    private candidateService: CandidateService,
    private router: Router
  ) {
    this.dataSource = new MatTableDataSource<Candidate>();
  }

  ngOnInit(): void {
    this.loadCandidates();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCandidates(): void {
    this.loading = true;
    this.error = '';

    this.candidateService.getCandidates().subscribe({
      next: (candidates) => {
        this.dataSource.data = candidates;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load candidates';
        this.loading = false;
        console.error('Error loading candidates:', error);
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

  openDrawer(candidateId?: string): void {
    this.selectedCandidateId = candidateId || null;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
    this.selectedCandidateId = null;
  }

  addCandidate(): void {
    this.openDrawer();
  }

  editCandidate(id: string): void {
    this.openDrawer(id);
  }

  deleteCandidate(id: string): void {
    if (confirm('Are you sure you want to delete this candidate?')) {
      this.candidateService.deleteCandidate(id).subscribe({
        next: () => {
          this.loadCandidates();
        },
        error: (error) => {
          this.error = 'Failed to delete candidate';
          console.error('Error deleting candidate:', error);
        }
      });
    }
  }

  scheduleInterview(id: string): void {
    this.router.navigate(['/interviews/schedule', id]);
  }

  viewInterviews(id: string): void {
    this.router.navigate(['/interviews/candidate', id]);
  }

  isHired(status: CandidateStatus): boolean {
    return status === CandidateStatus.Hired;
  }

  isRejected(status: CandidateStatus): boolean {
    return status === CandidateStatus.Rejected;
  }
} 