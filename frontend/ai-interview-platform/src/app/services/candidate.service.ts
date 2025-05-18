import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Candidate } from '../models/candidate.model';
import { JobDescription } from '../models/job-description.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = `${environment.apiUrl}/candidate`;

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.apiUrl);
  }

  getCandidate(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/${id}`);
  }

  createCandidate(candidate: any): Observable<Candidate> {
    // Convert enum strings to numbers
    const difficultyLevelMap: { [key: string]: number } = {
      'Basic': 0,
      'Intermediate': 1,
      'Advanced': 2
    };

    const modeMap: { [key: string]: number } = {
      'Oral': 0,
      'Coding': 1,
      'Both': 2
    };

    const scheduleTypeMap: { [key: string]: number } = {
      'Manual': 0,
      'Automatic': 1
    };

    const statusMap: { [key: string]: number } = {
      'Scheduled': 0,
      'Ongoing': 1,
      'Selected': 2,
      'Rejected': 3,
      'Pending': 4
    };

    const payload = {
      name: candidate.name,
      email: candidate.email,
      phoneNumber: candidate.phoneNumber,
      resumeContent: candidate.resumeContent || '',
      resumeContentBase64: candidate.resumeContent || '',
      resumePath: '',
      difficultyLevel: difficultyLevelMap[candidate.difficultyLevel as string] || 0,
      mode: modeMap[candidate.mode as string] || 0,
      scheduleType: scheduleTypeMap[candidate.scheduleType as string] || 0,
      status: statusMap[candidate.status as string] || 0,
      assignedJobDescriptionId: candidate.assignedJobDescriptionId,
      notes: candidate.notes || '',
      interviews: []
    };
    return this.http.post<Candidate>(this.apiUrl, payload);
  }

  updateCandidate(id: string, candidate: Partial<Candidate>): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, candidate);
  }

  deleteCandidate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  uploadResume(id: string, file: File): Observable<Candidate> {
    const formData = new FormData();
    formData.append('resume', file);
    return this.http.post<Candidate>(`${this.apiUrl}/${id}/resume`, formData);
  }
} 