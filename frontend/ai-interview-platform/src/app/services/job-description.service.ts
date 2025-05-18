import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { JobDescription } from '../models/job-description.model';

@Injectable({
  providedIn: 'root'
})
export class JobDescriptionService {
  private apiUrl = `${environment.apiUrl}/jobdescription`;

  constructor(private http: HttpClient) {}

  getJobDescriptions(): Observable<JobDescription[]> {
    return this.http.get<JobDescription[]>(this.apiUrl);
  }

  getJobDescription(id: string): Observable<JobDescription> {
    return this.http.get<JobDescription>(`${this.apiUrl}/${id}`);
  }

  createJobDescription(jobDescription: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>): Observable<JobDescription> {
    return this.http.post<JobDescription>(this.apiUrl, jobDescription);
  }

  updateJobDescription(id: string, jobDescription: Partial<JobDescription>): Observable<JobDescription> {
    return this.http.put<JobDescription>(`${this.apiUrl}/${id}`, jobDescription);
  }

  deleteJobDescription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publishJobDescription(id: string): Observable<JobDescription> {
    return this.http.post<JobDescription>(`${this.apiUrl}/${id}/publish`, {});
  }

  closeJobDescription(id: string): Observable<JobDescription> {
    return this.http.post<JobDescription>(`${this.apiUrl}/${id}/close`, {});
  }
} 