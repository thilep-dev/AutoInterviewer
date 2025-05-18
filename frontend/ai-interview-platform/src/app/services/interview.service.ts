import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Interview } from '../models/interview.model';

@Injectable({
  providedIn: 'root'
})
export class InterviewService {
  private apiUrl = `${environment.apiUrl}/interview`;

  constructor(private http: HttpClient) {}

  getInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.apiUrl);
  }

  getInterview(id: string): Observable<Interview> {
    return this.http.get<Interview>(`${this.apiUrl}/${id}`);
  }

  createInterview(interview: Interview): Observable<Interview> {
    return this.http.post<Interview>(this.apiUrl, interview);
  }

  updateInterview(id: string, interview: Partial<Interview>): Observable<Interview> {
    return this.http.put<Interview>(`${this.apiUrl}/${id}`, interview);
  }

  deleteInterview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getInterviewsByCandidate(candidateId: string): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/candidate/${candidateId}`);
  }

  getInterviewsByJob(jobId: string): Observable<Interview[]> {
    return this.http.get<Interview[]>(`${this.apiUrl}/job/${jobId}`);
  }

  updateInterviewStatus(id: string, status: Interview['status']): Observable<Interview> {
    return this.http.patch<Interview>(`${this.apiUrl}/${id}/status`, { status });
  }

  addFeedback(id: string, feedback: string, rating: number): Observable<Interview> {
    return this.http.patch<Interview>(`${this.apiUrl}/${id}/feedback`, { feedback, rating });
  }
} 